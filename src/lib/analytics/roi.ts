export interface ROIInput {
  costPerError: number;
  avgFixMinutes: number;
  hourlyRate: number;
  volumePerPeriod: number;
}

function getPeriodsPerYear() {
  return 12;
}

export function calculateRoiImpact(
  violations: number,
  rows: number,
  input: ROIInput,
) {
  const manualReviewHours = rows > 0 ? (rows * 2) / 60 : 0;
  const automatedMinutes = Math.max(5, Math.ceil(rows / 500));
  const currentDefectCost = Math.floor(violations * input.costPerError);
  const fixTimeCost = Math.floor(((violations * input.avgFixMinutes) / 60) * input.hourlyRate);
  const totalRisk = currentDefectCost + fixTimeCost;
  const projectedSavings = Math.floor(totalRisk * 0.7);
  const timeSavedPerAudit = Math.floor(Math.max(0, manualReviewHours - automatedMinutes / 60));
  const annualizedSavings = Math.floor(projectedSavings * getPeriodsPerYear());

  return {
    currentDefectCost,
    fixTimeCost,
    totalRisk,
    projectedSavings,
    timeSavedPerAudit,
    annualizedSavings,
    periodLabel: "month",
    volumePerPeriod: input.volumePerPeriod,
  };
}
