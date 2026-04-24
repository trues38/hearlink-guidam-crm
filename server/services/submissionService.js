/**
 * Submission Service v1.0
 *
 * Handles:
 * - Fax queue with idempotency + retry
 * - ZIP package generation for local government
 * - Submission checklist
 */

const crypto = require('crypto');

/**
 * Generate idempotency key
 */
function generateIdempotencyKey(customerId, documentType, action) {
  const timestamp = Date.now();
  const data = `${customerId}:${documentType}:${action}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Check if a fax request is already in queue (idempotency)
 */
async function findExistingFaxRequest(prisma, { customerId, faxNumber, documentType }) {
  const existing = await prisma.faxQueue.findFirst({
    where: {
      customerId,
      faxNumber,
      documentType,
      status: { in: ['QUEUED', 'TRANSMITTING', 'SENT'] }
    }
  });
  return existing;
}

/**
 * Add fax to queue with idempotency check
 */
async function queueFax(prisma, { centerId, customerId, draftId, faxNumber, documentType, fileUrl, idempotencyKey }) {
  // Check for existing request
  if (!idempotencyKey) {
    idempotencyKey = generateIdempotencyKey(customerId, documentType, 'FAX');
  }

  // Check if this idempotency key already exists
  const existing = await prisma.faxQueue.findFirst({
    where: {
      customerId,
      documentType,
      status: { in: ['QUEUED', 'TRANSMITTING', 'SENT'] }
    }
  });

  if (existing) {
    return {
      success: true,
      alreadyExists: true,
      fax: existing,
      message: 'Fax already queued or sent'
    };
  }

  // Create new fax request
  const fax = await prisma.faxQueue.create({
    data: {
      centerId,
      customerId,
      draftId,
      faxNumber,
      documentType,
      fileUrl,
      status: 'QUEUED'
    }
  });

  return {
    success: true,
    alreadyExists: false,
    fax,
    idempotencyKey
  };
}

/**
 * Process fax retry with exponential backoff
 */
async function retryFax(prisma, faxId, maxAttempts = 3) {
  const fax = await prisma.faxQueue.findUnique({ where: { id: faxId } });
  if (!fax) return { error: 'Fax not found' };

  if (fax.attempts >= maxAttempts) {
    await prisma.faxQueue.update({
      where: { id: faxId },
      data: { status: 'FAILED', lastError: 'Max attempts reached' }
    });
    return { error: 'Max attempts reached', fax };
  }

  // Exponential backoff: 5s, 25s, 125s
  const delay = Math.pow(5, fax.attempts) * 1000;
  const nextRetryAt = new Date(Date.now() + delay);

  const updated = await prisma.faxQueue.update({
    where: { id: faxId },
    data: {
      status: 'QUEUED',
      attempts: { increment: 1 },
      lastError: null,
      queuedAt: nextRetryAt
    }
  });

  return { success: true, fax: updated, nextRetryAt };
}

/**
 * Mark fax as sent
 */
async function markFaxSent(prisma, faxId) {
  const updated = await prisma.faxQueue.update({
    where: { id: faxId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      completedAt: new Date()
    }
  });

  // Create customer event
  await prisma.customerEvent.create({
    data: {
      customerId: updated.customerId,
      eventType: 'FAX_SENT',
      payload: JSON.stringify({ faxId: updated.id, documentType: updated.documentType })
    }
  });

  return updated;
}

/**
 * Mark fax as failed
 */
async function markFaxFailed(prisma, faxId, errorMessage) {
  const updated = await prisma.faxQueue.update({
    where: { id: faxId },
    data: {
      status: 'FAILED',
      lastError: errorMessage
    }
  });

  return updated;
}

/**
 * Generate submission package for local government
 */
async function generateSubmissionPackage(prisma, { centerId, customerId, track, includedDraftIds }) {
  // Get all drafts
  const drafts = await prisma.documentDraft.findMany({
    where: {
      id: { in: includedDraftIds },
      customerId,
      centerId
    }
  });

  // Get customer data
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      ptaRecords: { orderBy: { computedAt: 'desc' }, take: 1 },
      conformityRecords: { orderBy: { round: 'desc' }, take: 1 }
    }
  });

  if (!customer) {
    return { error: 'Customer not found' };
  }

  // Generate checklist
  const checklist = generateChecklist(drafts, customer, track);

  // Create submission package record
  const pkg = await prisma.submissionPackage.create({
    data: {
      centerId,
      customerId,
      track,
      status: checklist.canSubmit ? 'READY' : 'PENDING',
      includedDrafts: includedDraftIds,
      missingDocuments: checklist.missingDocuments,
      requiresSignature: checklist.requiresSignature,
      sensitiveWarnings: checklist.sensitiveWarnings
    }
  });

  return {
    package: pkg,
    checklist,
    customer: {
      id: customer.id,
      name: customer.name,
      recipientType: customer.recipientType
    },
    canSubmit: checklist.canSubmit
  };
}

/**
 * Generate submission checklist
 */
function generateChecklist(drafts, customer, track) {
  const checklist = {
    missingDocuments: [],
    requiresSignature: [],
    sensitiveWarnings: [],
    canSubmit: true
  };

  // Check all drafts have required fields
  for (const draft of drafts) {
    if (draft.missingCritical && draft.missingCritical.length > 0) {
      checklist.missingDocuments.push({
        draftId: draft.id,
        templateId: draft.templateId,
        missingFields: draft.missingCritical
      });
      checklist.canSubmit = false;
    }

    // Check for sensitive fields
    const fieldStates = typeof draft.fieldStates === 'string' ? JSON.parse(draft.fieldStates) : draft.fieldStates;
    for (const [field, state] of Object.entries(fieldStates)) {
      if (state === 'SENSITIVE') {
        checklist.sensitiveWarnings.push({
          draftId: draft.id,
          field,
          warning: '민감정보 포함 - 제출 전 확인 필요'
        });
      }
    }
  }

  // Check signature
  if (!customer.signatureKey) {
    checklist.requiresSignature.push({
      type: 'CUSTOMER_SIGNATURE',
      reason: '고객 서명 필요'
    });
    checklist.canSubmit = false;
  }

  // Track-specific checks
  if (track === 'LOCAL') {
    // Need prescription for local track
    if (!customer.hospitalName) {
      checklist.missingDocuments.push({
        type: 'PRESCRIPTION',
        reason: '처방전 발급 필요 (지자체 제출)'
      });
      checklist.canSubmit = false;
    }
  }

  return checklist;
}

/**
 * Get fax queue status
 */
async function getFaxQueueStatus(prisma, { centerId, customerId, status }) {
  const where = { centerId };
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  const items = await prisma.faxQueue.findMany({
    where,
    orderBy: { queuedAt: 'desc' }
  });

  const stats = {
    QUEUED: items.filter(f => f.status === 'QUEUED').length,
    TRANSMITTING: items.filter(f => f.status === 'TRANSMITTING').length,
    SENT: items.filter(f => f.status === 'SENT').length,
    FAILED: items.filter(f => f.status === 'FAILED').length
  };

  return { items, stats };
}

module.exports = {
  generateIdempotencyKey,
  findExistingFaxRequest,
  queueFax,
  retryFax,
  markFaxSent,
  markFaxFailed,
  generateSubmissionPackage,
  generateChecklist,
  getFaxQueueStatus
};
