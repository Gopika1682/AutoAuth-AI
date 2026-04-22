export type Role = 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  specialization?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  painHistory: string;
  medicalHistory: string;
  files: {
    name: string;
    type: string;
    url: string;
  }[];
  doctorId: string;
  insurance: {
    available: boolean;
    company?: string;
    policyNumber?: string;
    validTill?: string;
      plan?: 'Basic' | 'Premium';
      coverageAmount?: number | string;
  };
}

export interface AuthRequest {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  clinicalNotes: string;
  aiAnalysis?: {
    condition: string;
    duration: string;
    evidence: string;
    summary: string;
    justification: string;
    estimated_treatment_cost?: string;
    estimated_approved_amount?: string;
  };
  justification: string;
  estimated_treatment_cost?: string;
  estimated_approved_amount?: string;
  status: 'pending' | 'approved' | 'rejected' | 'direct-treatment';
  adminComments?: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  rule: string;
  active: boolean;
}
