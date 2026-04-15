/**
 * Government Support Calculator v1.0
 *
 * Handles:
 * - PTA (Pure Tone Average) calculation
 * - Hearing grade classification (HIGH/BORDERLINE/LOW)
 * - Government support track decision (national/local)
 * - Next action suggestions based on customer state
 */

// PTA thresholds for hearing loss severity
const PTA_THRESHOLDS = {
  HIGH: 62,       // >= 62 dB - 장애등급 가능성 높음
  BORDERLINE: 58  // 58-61 dB - 경계
};

/**
 * Calculate PTA4 (Pure Tone Average at 500, 1000, 2000, 4000 Hz)
 */
function calculatePTA(pureToneResults) {
  // Filter for 500, 1000, 2000, 4000 Hz AC (Air Conduction)
  const frequencies = [500, 1000, 2000, 4000];
  const results = {};

  for (const freq of frequencies) {
    const result = pureToneResults.find(
      r => r.frequency === freq && r.testType === 'AC' && !r.noResponse
    );
    results[freq] = result ? result.decibel : null;
  }

  // Calculate average if all frequencies have values
  const values = Object.values(results).filter(v => v !== null);
  if (values.length === 4) {
    const pta = Math.round(values.reduce((a, b) => a + b, 0) / 4);
    return { pta, breakdown: results };
  }

  return { pta: null, breakdown: results, warning: 'Missing frequency data' };
}

/**
 * Determine hearing grade based on PTA
 */
function determineHearingGrade(pta) {
  if (pta === null) return null;
  if (pta >= PTA_THRESHOLDS.HIGH) return 'HIGH';
  if (pta >= PTA_THRESHOLDS.BORDERLINE) return 'BORDERLINE';
  return 'LOW';
}

/**
 * Calculate disability level for government support
 * Korea uses different grades based on PTA and hearing configuration
 */
function calculateDisabilityLevel(pta4Right, pta4Left, earType) {
  // Get the better ear (lower PTA = better hearing)
  const betterEar = Math.min(pta4Right || 100, pta4Left || 100);
  const worseEar = Math.max(pta4Right || 0, pta4Left || 0);

  if (betterEar >= 100) return { level: '1급', description: '심신|USA严重影响' };
  if (betterEar >= 90) return { level: '2급', description: '심신|USA严重影响' };
  if (betterEar >= 80) return { level: '3급', description: '심신|USA严重影响' };
  if (betterEar >= 70) return { level: '4급', description: '심신 중증' };
  if (betterEar >= 60) return { level: '5급', description: '심신' };
  if (betterEar >= 50) return { level: '6급', description: '기타 등급' };

  return { level: null, description: '등급 해당 없음' };
}

/**
 * Determine government support track
 * - LOCAL: Medical category 1 recipients (의료1종) - 100% coverage via local government
 * - NATIONAL: General/Near-poverty - National Health Insurance + Hearing Aid Subsidy
 */
function determineGovernmentTrack(customer, ptaResult) {
  const { recipientType, governmentSupportType } = customer;

  // Medical category 1 recipient (의료1종) - always local track
  if (recipientType === 'RECIPIENT') {
    return {
      track: 'LOCAL',
      description: '지자체 제출 (의료1종 수급자)',
      coverage: '100%',
      submissionMethod: 'ZIP 다운로드 + 직접 제출'
    };
  }

  // Near-poverty (차상위) - national track with 100% coverage
  if (recipientType === 'NEAR_POVERTY') {
    return {
      track: 'NATIONAL',
      description: '공단 제출 (차상위)',
      coverage: '100%',
      submissionMethod: '팩스 제출'
    };
  }

  // General - national track with 90% coverage
  if (recipientType === 'GENERAL') {
    return {
      track: 'NATIONAL',
      description: '공단 제출 (일반)',
      coverage: '90%',
      submissionMethod: '팩스 제출'
    };
  }

  // Default based on government support type
  if (governmentSupportType === 'DISABILITY_GRADE_HOLDER' || governmentSupportType === 'POTENTIAL_DISABILITY') {
    return {
      track: 'NATIONAL',
      description: '공단 제출 (장애 지원)',
      coverage: '90%',
      submissionMethod: '팩스 제출'
    };
  }

  // No clear track - needs manual determination
  return {
    track: null,
    description: '트랙 미확정 - 담당자 확인 필요',
    coverage: null,
    submissionMethod: null
  };
}

/**
 * Customer position classification for consultation
 * Based on the 5-position model:
 * 1. 신규미착용 (NEW_NO_DEVICE) - Never had hearing aid
 * 2. 타사전환 (SWITCHING) - Switching from competitor
 * 3. 자사미사용 (HEARDOTCOM_UNUSED) - Have device but not using
 * 4. 자사교체 (HEARDOTCOM_REPLACE) - Replacing/upgrading own device
 * 5. AS수리 (REPAIR) - Repair/maintenance
 */
const CustomerPosition = {
  NEW_NO_DEVICE: '신규미착용',
  SWITCHING: '타사전환',
  HEARDOTCOM_UNUSED: '자사미사용',
  HEARDOTCOM_REPLACE: '자사교체',
  REPAIR: 'AS수리'
};

function suggestCustomerPosition(customer) {
  const { classification, devices, fittingLogs } = customer;

  // Check if customer has devices
  const hasDevices = devices && devices.length > 0;
  const hasFittings = fittingLogs && fittingLogs.length > 0;

  // No device, no fitting -> NEW_NO_DEVICE
  if (!hasDevices && !hasFittings) {
    return {
      position: CustomerPosition.NEW_NO_DEVICE,
      confidence: 0.95,
      recommendation: '처음 보청기를 찾으시는 고객입니다. 상담을 통해 필요성을 안내하세요.'
    };
  }

  // Check classification
  if (classification === 'OTHER') {
    return {
      position: CustomerPosition.SWITCHING,
      confidence: 0.9,
      recommendation: '타기관 경로 고객입니다. 기존 사용 경험을 파악하세요.'
    };
  }

  if (classification === 'HEARDOTCOM') {
    // Check if actively using
    const recentFitting = hasFittings ? fittingLogs[0] : null;
    if (recentFitting) {
      const daysSinceLastFitting = (Date.now() - new Date(recentFitting.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastFitting > 180) {
        return {
          position: CustomerPosition.HEARDOTCOM_UNUSED,
          confidence: 0.85,
          recommendation: '장기간 내방이 없는 고객입니다. 재방문 동기를 부여하세요.'
        };
      }
    }

    // Has recent activity -> might be upgrade/replace
    return {
      position: CustomerPosition.HEARDOTCOM_REPLACE,
      confidence: 0.7,
      recommendation: '기존 고객의 교체/업그레이드需求的可能性があります.'
    };
  }

  // Self-classified with device but no recent fitting
  if (classification === 'SELF' && hasDevices) {
    return {
      position: CustomerPosition.HEARDOTCOM_UNUSED,
      confidence: 0.6,
      recommendation: '보청기를 보유하고 계신 것으로 파악됩니다. 사용 현황을 확인하세요.'
    };
  }

  return {
    position: null,
    confidence: 0,
    recommendation: '고객 위치를 파악할 수 없습니다. 직접 확인이 필요합니다.'
  };
}

/**
 * Suggest next actions based on customer state and government track
 */
function suggestNextActions(customer, governmentTrack, ptaResult) {
  const actions = [];
  const position = suggestCustomerPosition(customer);

  // Position-based actions
  switch (position.position) {
    case CustomerPosition.NEW_NO_DEVICE:
      actions.push({
        type: 'CONSULT_SCHEDULING',
        title: '상담 예약',
        description: '초진 상담을 진행하세요',
        priority: 1,
        dueDays: 0
      });
      actions.push({
        type: 'HEARING_TEST',
        title: '청력검사',
        description: 'PTA 측정을 진행하세요',
        priority: 2,
        dueDays: 0
      });
      break;

    case CustomerPosition.SWITCHING:
      actions.push({
        type: 'DEVICE_EVALUATION',
        title: '기존 장비 평가',
        description: '기존 보청기型号 및 상태 확인',
        priority: 1,
        dueDays: 1
      });
      break;

    case CustomerPosition.HEARDOTCOM_REPLACE:
      actions.push({
        type: 'UPGRADE_COUNSELING',
        title: '교체 상담',
        description: '新型 장비 옵션 안내',
        priority: 1,
        dueDays: 3
      });
      break;

    case CustomerPosition.HEARDOTCOM_UNUSED:
      actions.push({
        type: 'FITTING_FOLLOWUP',
        title: '피팅 후 확인',
        description: '사용 불편 사항 파악',
        priority: 1,
        dueDays: 7
      });
      break;

    case CustomerPosition.REPAIR:
      actions.push({
        type: 'REPAIR_REQUEST',
        title: '수리 요청',
        description: 'AS팀에 수리 의뢰',
        priority: 1,
        dueDays: 0
      });
      break;
  }

  // Government track based actions
  if (governmentTrack.track === 'LOCAL') {
    actions.push({
      type: 'DOCUMENT_CHECKLIST_LOCAL',
      title: '지자체 제출 준비',
      description: '의료1종용 서류 확인',
      priority: 1,
      dueDays: 7
    });
    actions.push({
      type: 'PRESCRIPTION_FIRST',
      title: '처방전 먼저 발급',
      description: '지자체 제출에는 처방전 先 제출 필요',
      priority: 2,
      dueDays: 3
    });
  } else if (governmentTrack.track === 'NATIONAL') {
    actions.push({
      type: 'DOCUMENT_CHECKLIST_NATIONAL',
      title: '공단 제출 준비',
      description: '팩스 제출용 서류 확인',
      priority: 1,
      dueDays: 14
    });
  }

  // PTA-based actions
  if (ptaResult?.grade === 'HIGH') {
    actions.push({
      type: 'DISABILITY_CERTIFICATION',
      title: '장애등급 확인',
      description: 'PTA 등급 확인 및 등급证书 발급',
      priority: 2,
      dueDays: 30
    });
  }

  // Sort by priority
  actions.sort((a, b) => a.priority - b.priority);

  return {
    position,
    governmentTrack,
    ptaGrade: ptaResult?.grade,
    actions
  };
}

module.exports = {
  PTA_THRESHOLDS,
  CustomerPosition,
  calculatePTA,
  determineHearingGrade,
  calculateDisabilityLevel,
  determineGovernmentTrack,
  suggestCustomerPosition,
  suggestNextActions
};
