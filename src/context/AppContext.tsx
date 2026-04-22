import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Patient, AuthRequest, Policy } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  requests: AuthRequest[];
  policies: Policy[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  registerDoctor: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  approveDoctor: (id: string) => Promise<void>;
  rejectDoctor: (id: string) => Promise<void>;
  addPatient: (data: Omit<Patient, 'id' | 'doctorId'>) => Promise<string>;
  createRequest: (data: Omit<AuthRequest, 'id' | 'doctorId' | 'status' | 'createdAt'>) => Promise<void>;
  updateRequestStatus: (id: string, status: 'approved' | 'rejected', comments?: string) => Promise<void>;
  updatePatient: (dbId: number, data: Omit<Patient, 'id' | 'doctorId'>) => Promise<void>;
  addPolicy: (rule: string) => void;
  togglePolicy: (id: string) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('autoauth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [policies, setPolicies] = useState<Policy[]>(() => {
    const saved = localStorage.getItem('autoauth_policies');
    const initialPolicies: Policy[] = [
      { id: 'p1', rule: 'Premium Plan: Approve all treatments automatically if AI justification is strong.', active: true },
      { id: 'p2', rule: 'Basic Plan: Approve only imaging/scans (MRI, X-ray). Manual review for others.', active: true },
      { id: 'p3', rule: 'Expired Policy: Reject all authorization requests immediately.', active: true }
    ];
    return saved ? JSON.parse(saved) : initialPolicies;
  });

  const refreshData = async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === 'admin') {
        const doctorsRes = await fetch('/api/admin/doctors');
        const doctors = await doctorsRes.json();
        setUsers(doctors.map((d: any) => ({
          ...d,
          role: 'doctor',
          status: (d.status || '').toLowerCase()
        })));
      }

      const patientsRes = await fetch('/api/doctor/patients');
      const patientsData = await patientsRes.json();
      setPatients(patientsData.map((p: any) => ({
        id: p.patient_id,
        db_id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        contact: p.contact,
        painHistory: p.pain_history ?? p.painHistory ?? '',
        medicalHistory: p.medical_history ?? p.medicalHistory ?? '',
        insurance: {
          available: p.available === 1 || p.available === 'true' || p.available === true,
          company: p.company ?? '',
          policyNumber: p.policy_number ?? p.policyNumber ?? '',
          validTill: p.valid_till ?? p.validTill ?? '',
          plan: p.plan ?? 'Basic'
        },
        reports: {
          xray: p.xray ?? '',
          mri: p.mri ?? '',
          labReport: p.lab_report ?? p.labReport ?? ''
        }
      })));

      const requestsRes = await fetch('/api/requests');
      const requestsData = await requestsRes.json();
      setRequests(requestsData.map((r: any) => ({
        ...r,
        id: r.request_id,
        db_id: r.id,
        patientId: r.patient_code,
        doctorId: r.doctor_id.toString(),
        status: r.status.toLowerCase(),
        adminComments: r.admin_comment,
        createdAt: r.created_at,
        aiAnalysis: r.ai_analysis || r.aiAnalysis || null
      })));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('autoauth_user', JSON.stringify(currentUser));
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('autoauth_policies', JSON.stringify(policies));
  }, [policies]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('autoauth_user');
  };

  const registerDoctor = async (data: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      return result;
    } catch (error) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const approveDoctor = async (id: string) => {
    await fetch(`/api/admin/doctors/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    });
    await refreshData();
  };

  const rejectDoctor = async (id: string) => {
    await fetch(`/api/admin/doctors/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' })
    });
    await refreshData();
  };

  const addPatient = async (data: Omit<Patient, 'id' | 'doctorId'>) => {
    const res = await fetch('/api/doctor/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        insurance: data.insurance,
        reports: data.reports ? { xray: data.reports.xray ?? '', mri: data.reports.mri ?? '', lab_report: data.reports.labReport ?? '' } : { xray: '', mri: '', lab_report: '' }
      })
    });
    const result = await res.json();
    await refreshData();
    return result.patient_id;
  };

  const updatePatient = async (dbId: number, data: Omit<Patient, 'id' | 'doctorId'>) => {
    await fetch(`/api/doctor/patients/${dbId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        insurance: data.insurance,
        reports: data.reports ? { xray: data.reports.xray ?? '', mri: data.reports.mri ?? '', lab_report: data.reports.labReport ?? '' } : { xray: '', mri: '', lab_report: '' }
      })
    });
    await refreshData();
  };

  const createRequest = async (data: Omit<AuthRequest, 'id' | 'doctorId' | 'status' | 'createdAt'>) => {
    const payload: any = {
      patient_id: (data as any).patientId || (data as any).patient_id,
      doctor_id: currentUser?.id,
      diagnosis: (data as any).diagnosis,
      treatment: (data as any).treatment,
      clinical_notes: (data as any).clinicalNotes || (data as any).clinical_notes || '',
      ai_analysis: (data as any).aiAnalysis || (data as any).ai_analysis || null,
      justification: (data as any).justification || ''
    };

    try {
      await fetch('/api/doctor/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error;
    }

    await refreshData();
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', comments?: string) => {
    // We need the internal DB ID
    const request = requests.find(r => r.id === id);
    if (!request) return;

    await fetch(`/api/admin/requests/${(request as any).db_id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status.charAt(0).toUpperCase() + status.slice(1), admin_comment: comments })
    });
    await refreshData();
  };

  const addPolicy = (rule: string) => {
    setPolicies(prev => [...prev, { id: `pol-${Date.now()}`, rule, active: true }]);
  };

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, patients, requests, policies,
      login, logout, registerDoctor, approveDoctor, rejectDoctor,
      addPatient, updatePatient, createRequest, updateRequestStatus, addPolicy, togglePolicy,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
