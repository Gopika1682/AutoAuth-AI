// Helper function to estimate treatment cost and approved amount based on treatment type and insurance details
const estimateCosts = (
  treatment: string,
  plan?: 'Basic' | 'Premium',
  coverageAmount?: number | string
): { estimated_treatment_cost: string; estimated_approved_amount: string } => {
  // Treatment cost estimation based on common medical procedures (in INR)
  const treatmentCosts: Record<string, number> = {
    'mri': 15000,
    'ct scan': 12000,
    'x-ray': 800,
    'ultrasound': 1500,
    'ecg': 500,
    'blood test': 2000,
    'arthroscopy': 80000,
    'surgery': 200000,
    'bypass': 500000,
    'transplant': 1000000,
    'physiotherapy': 5000,
    'consultation': 1000,
    'knee replacement': 300000,
    'hip replacement': 350000,
    'cataract': 25000,
    'cardiac': 150000,
  };

  // Estimate treatment cost based on keywords in treatment description
  let treatmentCost = 100000; // Default estimate
  const treatmentLower = treatment.toLowerCase();
  
  for (const [keyword, cost] of Object.entries(treatmentCosts)) {
    if (treatmentLower.includes(keyword)) {
      treatmentCost = cost;
      break;
    }
  }

  // Calculate approved amount based on insurance plan
  let approvedAmount = 0;
  const coverage = typeof coverageAmount === 'string' ? parseInt(coverageAmount, 10) : coverageAmount || 0;

  if (!plan) {
    approvedAmount = 0;
  } else if (plan === 'Premium') {
    // Premium: 80-90% of treatment cost
    approvedAmount = Math.round(treatmentCost * 0.85);
  } else if (plan === 'Basic') {
    // Basic: 50-70% of treatment cost
    approvedAmount = Math.round(treatmentCost * 0.6);
  }

  // Cap approved amount by coverage limit
  if (coverage > 0 && approvedAmount > coverage) {
    approvedAmount = coverage;
  }

  // Format as Indian currency (₹)
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return {
    estimated_treatment_cost: formatCurrency(treatmentCost),
    estimated_approved_amount: formatCurrency(approvedAmount),
  };
};

// Client-side synthetic Insurance Analysis AI.
// Returns structured analysis based on clinical notes, uploaded reports, and insurance details.
export const analyzeClinicalNotes = async (
  notes: string,
  reports?: { xray?: string; mri?: string; labReport?: string },
  insurance?: { available?: boolean; company?: string; policyNumber?: string; validTill?: string; plan?: 'Basic' | 'Premium'; coverageAmount?: number | string },
  treatment?: string
) => {
  // Basic input checks
  if (!notes || notes.trim().length === 0) {
    const costs = estimateCosts(treatment || '', insurance?.plan, insurance?.coverageAmount);
    return {
      medicalSummary: { condition: 'No notes provided', severity: 'unknown', treatmentNeeded: 'N/A' },
      insuranceQuality: insurance?.available ? 'Average' : 'Weak',
      approvalProbability: 0,
      positiveInsights: [],
      negativeInsights: ['No clinical notes provided'],
      improvementSuggestions: ['Add clinical notes describing symptoms and prior treatments'],
      justification: 'Insufficient information.',
      estimated_treatment_cost: costs.estimated_treatment_cost,
      estimated_approved_amount: costs.estimated_approved_amount,
    };
  }

  // Heuristic scoring for synthetic analysis
  let score = 40; // base

  const textLen = notes.trim().length;
  if (textLen > 300) score += 10;
  if (textLen > 600) score += 5;

  // Reports boost
  const hasMRI = !!reports?.mri;
  const hasXray = !!reports?.xray;
  const hasLab = !!reports?.labReport;
  if (hasMRI) score += 15;
  if (hasXray) score += 8;
  if (hasLab) score += 5;

  // Insurance plan influence
  const plan = insurance?.plan || 'Basic';
  if (insurance?.available) {
    if (plan === 'Premium') score += 20;
    if (plan === 'Basic') score += 5;
  } else {
    score -= 20;
  }

  // Validity influence
  if (insurance?.validTill) {
    const validDate = new Date(insurance.validTill);
    const days = Math.ceil((validDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 90) score += 10;
    if (days <= 30) score -= 25;
  }

  // Severity heuristic from keywords
  const severityKeywords = ['severe', 'acute', 'chronic', 'moderate', 'progressive', 'debilitating'];
  let severity = 'Moderate';
  const lower = notes.toLowerCase();
  if (lower.includes('severe') || lower.includes('debilitating') || lower.includes('acute')) {
    severity = 'High';
    score += 10;
  } else if (lower.includes('mild') || lower.includes('occasional')) {
    severity = 'Low';
    score -= 5;
  }

  // Normalize probability
  let approvalProbability = Math.max(0, Math.min(100, Math.round(score)));

  // Determine policy strength
  let insuranceQuality: 'Strong' | 'Average' | 'Weak' = 'Average';
  if (!insurance?.available) insuranceQuality = 'Weak';
  else if (approvalProbability > 80) insuranceQuality = 'Strong';
  else if (approvalProbability >= 50) insuranceQuality = 'Average';
  else insuranceQuality = 'Weak';

  // Insights & suggestions
  const positiveInsights: string[] = [];
  const negativeInsights: string[] = [];
  const improvementSuggestions: string[] = [];

  if (insurance?.available) positiveInsights.push('Valid policy present');
  if (plan === 'Premium') positiveInsights.push('Premium plan offers broader coverage');
  if (hasMRI) positiveInsights.push('MRI report attached (strong supporting evidence)');
  if (hasXray) positiveInsights.push('X-Ray available');

  if (!insurance?.available) negativeInsights.push('No insurance on file');
  if (insurance?.validTill) {
    const validDate = new Date(insurance.validTill);
    const daysLeft = Math.ceil((validDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) negativeInsights.push('Policy validity is near expiry');
  }
  if (textLen < 200) negativeInsights.push('Clinical notes are brief; insufficient documented evidence');
  if (!hasMRI && !hasXray && !hasLab) improvementSuggestions.push('Add MRI report');
  if (!lower.includes('specialist') && severity === 'High') improvementSuggestions.push('Include specialist consultation notes');
  if (textLen < 400) improvementSuggestions.push('Extend medical history details and prior treatments');

  if (approvalProbability >= 80) {
    positiveInsights.push('Policy appears to cover required treatment');
    improvementSuggestions.push('Ensure all imaging and specialist reports are attached');
  } else if (approvalProbability < 50) {
    negativeInsights.push('Policy may not cover higher-cost procedures');
  }

  const condition = lower.split('\n')[0].slice(0, 180) || 'Condition extracted from notes';

  const costs = estimateCosts(treatment || '', insurance?.plan, insurance?.coverageAmount);

  const result = {
    medicalSummary: {
      condition: condition.charAt(0).toUpperCase() + condition.slice(1),
      severity,
      treatmentNeeded: 'As documented by clinician: ' + (notes.split('\n')[0] || notes.slice(0, 120))
    },
    insuranceQuality,
    approvalProbability,
    positiveInsights,
    negativeInsights,
    improvementSuggestions,
    justification: `AI-derived justification based on notes and reports (score ${approvalProbability}%)`,
    estimated_treatment_cost: costs.estimated_treatment_cost,
    estimated_approved_amount: costs.estimated_approved_amount,
  };

  return result;
};
