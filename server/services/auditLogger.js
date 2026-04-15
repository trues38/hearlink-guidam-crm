/**
 * Audit Log Middleware v1.0
 *
 * Logs all sensitive field access and modifications
 */

// Fields that are considered sensitive (will be masked in logs)
const SENSITIVE_FIELDS = [
  'residentNumber',
  'ceoResidentNumber',
  'signatureKey',
  'password',
  'bankAccount',
  'accountNumber'
];

/**
 * Mask sensitive field value
 */
function maskSensitiveValue(fieldName, value) {
  if (!value) return null;
  if (SENSITIVE_FIELDS.includes(fieldName)) {
    if (fieldName === 'residentNumber') {
      return value.replace(/(\d{6})-(\d{7})/, '******-*******');
    }
    return '***MASKED***';
  }
  return value;
}

/**
 * Create audit log entry
 */
async function createAuditLog(prisma, { centerId, userId, entityType, entityId, action, fieldName, oldValue, newValue, ipAddress, userAgent }) {
  return prisma.auditLog.create({
    data: {
      centerId,
      userId,
      entityType,
      entityId,
      action,
      fieldName,
      oldValue: fieldName ? maskSensitiveValue(fieldName, oldValue) : oldValue,
      newValue: fieldName ? maskSensitiveValue(fieldName, newValue) : newValue,
      ipAddress,
      userAgent
    }
  });
}

/**
 * Audit middleware for customer updates
 */
async function auditCustomerUpdate(prisma, customerId, updates, userId, ipAddress, userAgent) {
  // Get current customer for comparison
  const current = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!current) return;

  const auditPromises = [];

  for (const [field, newValue] of Object.entries(updates)) {
    const oldValue = current[field];
    if (oldValue !== newValue) {
      const action = SENSITIVE_FIELDS.includes(field) ? 'VIEW_SENSITIVE' : 'UPDATE';
      auditPromises.push(createAuditLog(prisma, {
        centerId: current.centerId,
        userId,
        entityType: 'Customer',
        entityId: customerId,
        action,
        fieldName: field,
        oldValue,
        newValue,
        ipAddress,
        userAgent
      }));
    }
  }

  await Promise.all(auditPromises);
}

/**
 * Get audit logs for an entity
 */
async function getAuditLogs(prisma, { centerId, entityType, entityId, skip = 0, limit = 50 }) {
  const where = { centerId };
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { items, total };
}

/**
 * Express middleware to extract client info
 */
function extractClientInfo(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  };
}

module.exports = {
  SENSITIVE_FIELDS,
  maskSensitiveValue,
  createAuditLog,
  auditCustomerUpdate,
  getAuditLogs,
  extractClientInfo
};
