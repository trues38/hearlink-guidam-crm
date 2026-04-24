/**
 * Document Template Engine v1.0
 *
 * Handles:
 * - Template definitions for government documents
 * - Field state classification (AUTO/SENSITIVE/MANUAL)
 * - Draft generation with missing field calculation
 * - Auto-fill from customer data
 */

// Field states
const FieldState = {
  AUTO: 'AUTO',       // ✅ Can be auto-filled from customer data
  SENSITIVE: 'SENSITIVE', // 🔐 Requires masking, restricted access
  MANUAL: 'MANUAL'     // ✍️ Must be manually entered/verified
};

// Document templates with field definitions
const DOCUMENT_TEMPLATES = {
  DEVICE_CLAIM: {
    code: 'DEVICE_CLAIM',
    name: '보청기 급여 지급청구서',
    purpose: 'DEVICE',
    insuranceType: 'GENERAL',
    fields: {
      // Customer fields
      applicantName: { state: FieldState.AUTO, source: 'name', label: '신청인 성명' },
      applicantBirthDate: { state: FieldState.AUTO, source: 'birthDate', label: '생년월일' },
      applicantGender: { state: FieldState.AUTO, source: 'gender', label: '성별' },
      applicantAddress: { state: FieldState.AUTO, source: 'addressLine1', label: '주소' },
      applicantContact: { state: FieldState.AUTO, source: 'contactNumber', label: '연락처' },
      applicantResidentNumber: { state: FieldState.SENSITIVE, source: 'residentNumber', label: '주민등록번호' },

      // Device fields
      deviceType: { state: FieldState.AUTO, source: 'device.type', label: '보청기 종류' },
      deviceModel: { state: FieldState.AUTO, source: 'device.model', label: '모델명' },
      deviceEar: { state: FieldState.AUTO, source: 'device.ear', label: '귀 방향' },
      serialNumber: { state: FieldState.MANUAL, label: '시리얼번호' },

      // Medical fields
      hearingLossType: { state: FieldState.AUTO, source: 'lossType', label: '난청 종류' },
      hearingTestDate: { state: FieldState.AUTO, source: 'audiometry.createdAt', label: '청력검사일' },
      hospitalName: { state: FieldState.AUTO, source: 'hospitalName', label: '병원명' },

      // Government support
      governmentSupportType: { state: FieldState.AUTO, source: 'governmentSupportType', label: '지원 유형' },
      recipientType: { state: FieldState.AUTO, source: 'recipientType', label: '수급 구분' },

      // Payment info
      totalAmount: { state: FieldState.MANUAL, label: '총 금액' },
      subsidyAmount: { state: FieldState.AUTO, computed: 'calculateSubsidy', label: '급여 금액' },
      patientCopay: { state: FieldState.AUTO, computed: 'calculateCopay', label: '본인 부담금' },

      // Administrative
      applicationDate: { state: FieldState.AUTO, computed: 'today', label: '신청일' },
      signatureDate: { state: FieldState.MANUAL, label: '서명일' },
      signatureImage: { state: FieldState.SENSITIVE, source: 'signatureKey', label: '서명' }
    },
    requiredFields: ['applicantName', 'applicantBirthDate', 'deviceType', 'hearingLossType', 'governmentSupportType', 'totalAmount']
  },

  CONFORMITY_CERTIFICATE: {
    code: 'CONFORMITY_CERTIFICATE',
    name: '보청기 적합관리 확인서',
    purpose: 'CONFORMITY',
    insuranceType: 'GENERAL',
    fields: {
      customerName: { state: FieldState.AUTO, source: 'name', label: '고객 성명' },
      customerBirthDate: { state: FieldState.AUTO, source: 'birthDate', label: '생년월일' },
      customerContact: { state: FieldState.AUTO, source: 'contactNumber', label: '연락처' },

      fittingDate: { state: FieldState.AUTO, source: 'fitting.createdAt', label: '피팅일' },
      deviceInfo: { state: FieldState.AUTO, computed: 'deviceInfo', label: '장비 정보' },

      conformityStatus: { state: FieldState.MANUAL, label: '적합 상태' },
      conformityDate: { state: FieldState.MANUAL, label: '적합 확인일' },
      inspectorName: { state: FieldState.MANUAL, label: '검사자 성명' }
    },
    requiredFields: ['customerName', 'customerBirthDate', 'fittingDate', 'conformityStatus', 'inspectorName']
  },

  CONFORMITY_CLAIM: {
    code: 'CONFORMITY_CLAIM',
    name: '적합관리 급여청구서',
    purpose: 'CONFORMITY',
    insuranceType: 'GENERAL',
    fields: {
      applicantName: { state: FieldState.AUTO, source: 'name', label: '신청인' },
      applicantBirthDate: { state: FieldState.AUTO, source: 'birthDate', label: '생년월일' },
      recipientType: { state: FieldState.AUTO, source: 'recipientType', label: '수급 구분' },
      hospitalName: { state: FieldState.AUTO, source: 'hospitalName', label: '병원명' },
      conformityDate: { state: FieldState.AUTO, source: 'conformityRecord.reviewedAt', label: '적합 확인일' },
      conformityStatus: { state: FieldState.AUTO, source: 'conformityRecord.status', label: '적합 상태' },
      claimAmount: { state: FieldState.MANUAL, label: '청구 금액' }
    },
    requiredFields: ['applicantName', 'applicantBirthDate', 'recipientType', 'conformityStatus', 'claimAmount']
  },

  // 지자체용 문서 (의료1종 수급자)
  DEVICE_APPLICATION_LOCAL: {
    code: 'DEVICE_APPLICATION_LOCAL',
    name: '보청기 급여 신청서',
    purpose: 'DEVICE',
    insuranceType: 'LOCAL_MEDICAL',
    fields: {
      applicantName: { state: FieldState.AUTO, source: 'name', label: '성명' },
      applicantBirthDate: { state: FieldState.AUTO, source: 'birthDate', label: '생년월일' },
      applicantAddress: { state: FieldState.AUTO, source: 'addressLine1', label: '주소' },
      applicantResidentNumber: { state: FieldState.SENSITIVE, source: 'residentNumber', label: '주민등록번호' },
      recipientType: { state: FieldState.AUTO, source: 'recipientType', label: '수급자 구분' },
      hospitalName: { state: FieldState.AUTO, source: 'hospitalName', label: '관할 병원' },
      deviceType: { state: FieldState.MANUAL, label: '보청기 종류' },
      prescriptionDate: { state: FieldState.MANUAL, label: '처방전 발급일' },
      applicationDate: { state: FieldState.AUTO, computed: 'today', label: '신청일' }
    },
    requiredFields: ['applicantName', 'applicantBirthDate', 'recipientType', 'hospitalName']
  }
};

/**
 * Classify field states based on customer data availability
 */
function classifyFieldStates(template, customer, extraData = {}) {
  const fieldStates = {};
  const autoFilled = {};
  const missingFields = [];
  const missingCritical = [];

  for (const [fieldName, fieldDef] of Object.entries(template.fields)) {
    let state = fieldDef.state;
    let value = null;

    // Check if field can be auto-filled
    if (state === FieldState.AUTO) {
      if (fieldDef.source) {
        value = getNestedValue(extraData, fieldDef.source) || getNestedValue(customer, fieldDef.source);
      } else if (fieldDef.computed) {
        value = computeField(fieldDef.computed, customer, extraData);
      }

      if (value !== null && value !== undefined && value !== '') {
        fieldStates[fieldName] = FieldState.AUTO;
        autoFilled[fieldName] = value;
      } else {
        // Auto field that can't be filled
        fieldStates[fieldName] = FieldState.MANUAL;
        missingFields.push(fieldName);
        if (template.requiredFields.includes(fieldName)) {
          missingCritical.push(fieldName);
        }
      }
    } else if (state === FieldState.SENSITIVE) {
      // Sensitive fields are always present but masked
      const rawValue = getNestedValue(extraData, fieldDef.source) || getNestedValue(customer, fieldDef.source);
      if (rawValue) {
        fieldStates[fieldName] = FieldState.SENSITIVE;
        autoFilled[fieldName] = maskSensitive(rawValue, fieldDef.source);
      } else {
        fieldStates[fieldName] = FieldState.MANUAL;
        missingFields.push(fieldName);
      }
    } else {
      // MANUAL field
      if (template.requiredFields.includes(fieldName)) {
        missingFields.push(fieldName);
        missingCritical.push(fieldName);
      }
    }
  }

  const canAutoDraft = missingCritical.length === 0;

  return {
    fieldStates,
    autoFilled,
    missingFields,
    missingCritical,
    canAutoDraft
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Compute field value from computation type
 */
function computeField(computed, customer, extraData) {
  switch (computed) {
    case 'today':
      return new Date().toISOString().split('T')[0];
    case 'calculateSubsidy':
      // 90% subsidy for general, 100% for recipients
      const amount = extraData.totalAmount || 0;
      const rType1 = customer.recipientType;
      return rType1 === 'RECIPIENT' ? amount : Math.floor(amount * 0.9);
    case 'calculateCopay':
      const total = extraData.totalAmount || 0;
      const rType2 = customer.recipientType;
      return rType2 === 'RECIPIENT' ? 0 : Math.floor(total * 0.1);
    case 'deviceInfo':
      const device = extraData.device || customer.devices?.[0];
      return device ? `${device.brand} ${device.model}` : null;
    default:
      return null;
  }
}

/**
 * Mask sensitive data
 */
function maskSensitive(value, source) {
  if (!value) return null;
  if (source === 'residentNumber') {
    // 13-digit resident number: 000000-0000000 -> ****-*******
    return value.replace(/(\d{6})-(\d{7})/, '******-*******');
  }
  if (source === 'signatureKey') {
    return '[서명 있음]';
  }
  return value;
}

/**
 * Generate document draft
 */
function generateDraft(template, customer, extraData = {}) {
  const { fieldStates, autoFilled, missingFields, missingCritical, canAutoDraft } = classifyFieldStates(template, customer, extraData);

  const draftData = {};

  // Fill in auto-filled values
  for (const [field, value] of Object.entries(autoFilled)) {
    draftData[field] = {
      value,
      state: fieldStates[field],
      filled: true
    };
  }

  // Mark missing fields
  for (const field of missingFields) {
    draftData[field] = {
      value: null,
      state: fieldStates[field],
      filled: false,
      critical: missingCritical.includes(field)
    };
  }

  return {
    draftData,
    fieldStates,
    autoFilled,
    missingFields,
    missingCritical,
    canAutoDraft
  };
}

/**
 * Get submission checklist
 */
function getSubmissionChecklist(template, draft, customer) {
  const checklist = {
    missingDocuments: [],
    requiresSignature: [],
    sensitiveWarnings: [],
    canSubmit: true
  };

  // Check missing required fields
  if (draft.missingCritical.length > 0) {
    checklist.canSubmit = false;
    checklist.missingDocuments = draft.missingCritical.map(field => ({
      field,
      label: template.fields[field]?.label || field,
      reason: 'Required field is missing or cannot be auto-filled'
    }));
  }

  // Check for sensitive fields that need manual verification
  for (const [field, state] of Object.entries(draft.fieldStates)) {
    if (state === FieldState.SENSITIVE) {
      checklist.sensitiveWarnings.push({
        field,
        label: template.fields[field]?.label || field,
        warning: 'This field contains sensitive information. Verify before submission.'
      });
    }
  }

  // Check if signature is required and present
  if (template.fields.signatureImage && !draft.autoFilled.signatureImage) {
    checklist.requiresSignature.push({
      field: 'signatureImage',
      label: '서명',
      reason: '서명이 필요합니다'
    });
    checklist.canSubmit = false;
  }

  return checklist;
}

module.exports = {
  FieldState,
  DOCUMENT_TEMPLATES,
  classifyFieldStates,
  generateDraft,
  getSubmissionChecklist,
  maskSensitive
};
