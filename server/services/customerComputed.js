function computeCustomerInsights(customer) {
  const now = new Date();
  const insights = {
    ptaLevel: null,
    ptaDecibel: null,
    positionSuggestion: null,
    riskFlags: [],
    nextActions: []
  };

  if (!customer) return insights;

  const latestAudio = customer.audiometries?.[0];
  if (latestAudio?.pureToneResults?.length > 0) {
    const rightAirConduction = latestAudio.pureToneResults.filter(r => r.ear === 'RIGHT' && r.testType === 'AC');
    if (rightAirConduction.length > 0) {
      const avg = rightAirConduction.reduce((sum, r) => sum + r.decibel, 0) / rightAirConduction.length;
      insights.ptaDecibel = Math.round(avg);
      insights.ptaLevel = avg >= 58 ? 'high' : avg >= 41 ? 'borderline' : 'low';
    }
  }

  const hasDevices = customer.devices?.length > 0;
  const hasSchedule = customer.schedules?.length > 0;
  const hasConsultation = customer.consultations?.length > 0;
  const hasSale = customer.sales?.length > 0;
  const latestSale = customer.sales?.[0];
  const hasPaidSale = customer.sales?.some(s => s.status === 'PAID');

  if (!hasConsultation) {
    insights.positionSuggestion = '신규문의';
  } else if (!latestAudio) {
    insights.positionSuggestion = '검사전';
  } else if (!hasSale) {
    insights.positionSuggestion = '구매전';
  } else if (hasPaidSale) {
    insights.positionSuggestion = '자사사용중';
  } else if (latestSale?.status === 'UNPAID') {
    insights.positionSuggestion = '결제진행중';
  } else {
    insights.positionSuggestion = '기타';
  }

  if (hasConsultation && !hasSchedule) {
    insights.nextActions.push('다음 방문 일정 잡기');
  }
  if (latestAudio && !hasSale) {
    insights.nextActions.push('장비 상담 진행');
  }
  if (latestSale?.status === 'UNPAID') {
    insights.nextActions.push('결제 확인 필요');
  }
  if (!hasConsultation && !latestAudio) {
    insights.nextActions.push('초기 상담 예약');
  }

  if (latestSale?.status === 'UNPAID') {
    const saleDate = new Date(latestSale.createdAt);
    const daysSince = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
    if (daysSince > 14) {
      insights.riskFlags.push(`미결제 ${daysSince}일 경과`);
    }
  }
  const lastActivity = customer.workLogs?.[0]?.createdAt || customer.consultations?.[0]?.consultedAt;
  if (lastActivity) {
    const activityDate = new Date(lastActivity);
    const daysSince = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
    if (daysSince > 60) {
      insights.riskFlags.push(`최근 ${daysSince}일 활동 없음`);
    }
  }
  if (customer.sales?.some(s => s.status === 'UNPAID')) {
    insights.riskFlags.push('미결제 존재');
  }

  return insights;
}

module.exports = { computeCustomerInsights };
