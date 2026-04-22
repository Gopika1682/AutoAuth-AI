import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, Button, Input, Badge } from '../components/UI';
import { Layout } from '../components/Layout';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ShieldCheck,
  Search,
  Eye,
  Settings,
  PlusCircle,
  TrendingUp,
  BrainCircuit,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminDashboard: React.FC = () => {
  const { users, patients, requests } = useAppContext();
  const doctors = users.filter(u => u.role === 'doctor');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const approvalRate = requests.length > 0 ? Math.round((approvedRequests.length / requests.length) * 100) : 0;

  const stats = [
    { label: 'Total Doctors', value: doctors.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Patients', value: patients.length, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Requests', value: requests.length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">System overview and management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:scale-[1.02] transition-transform cursor-default" variant="gradient">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl shadow-sm", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Pending Doctor Approvals" subtitle="Doctors awaiting system access" variant="glass">
            <div className="space-y-3">
              {doctors.filter(d => d.status === 'pending').map((doc, index) => (
                <motion.div 
                  key={doc.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors font-black">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{doc.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{doc.specialization} • {doc.email}</p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </motion.div>
              ))}
              {doctors.filter(d => d.status === 'pending').length === 0 && (
                <div className="text-center py-12 text-gray-400 italic font-medium">No pending approvals.</div>
              )}
              <Button variant="ghost" className="w-full mt-2" onClick={() => window.location.href = '/doctor-approvals'}>
                Manage Doctors <PlusCircle className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>

          <Card title="Latest Requests" subtitle="Recent prior authorization submissions" variant="glass">
            <div className="space-y-3">
              {requests.slice(0, 5).map((req, index) => (
                <motion.div 
                  key={req.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{patients.find(p => p.id === req.patientId)?.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Dr. {users.find(u => u.id === req.doctorId)?.name} • {req.treatment}</p>
                    </div>
                  </div>
                  <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}>
                    {req.status}
                  </Badge>
                </motion.div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-12 text-gray-400 italic font-medium">No requests found.</div>
              )}
              <Button variant="ghost" className="w-full mt-2" onClick={() => window.location.href = '/request-management'}>
                View All Requests <FileSearch className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export const DoctorApprovals: React.FC = () => {
  const { users, approveDoctor, rejectDoctor } = useAppContext();
  const doctors = users.filter(u => u.role === 'doctor');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Approvals</h1>
          <p className="text-gray-500">Review and manage doctor registrations.</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{doc.specialization}</td>
                    <td className="px-6 py-4">
                      <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'danger' : 'warning'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button variant="success" size="sm" onClick={async () => await approveDoctor(doc.id)}>Approve</Button>
                          <Button variant="danger" size="sm" onClick={async () => await rejectDoctor(doc.id)}>Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export const RequestManagement: React.FC = () => {
  const { requests, patients, users, updateRequestStatus } = useAppContext();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAction = async (status: 'approved' | 'rejected') => {
    await updateRequestStatus(selectedRequest.id, status, status === 'rejected' ? rejectReason : 'Approved by system manager');
    setSelectedRequest(null);
    setRejectReason('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
          <p className="text-gray-500">Review and process prior authorization requests.</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Treatment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{patients.find(p => p.id === req.patientId)?.name}</p>
                      <p className="text-xs text-gray-500">{req.patientId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">Dr. {users.find(u => u.id === req.doctorId)?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.treatment}</td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {selectedRequest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                      <p className="text-gray-500">ID: {selectedRequest.id}</p>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Patient Information</h3>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                          {(() => {
                            const p = patients.find(p => p.id === selectedRequest.patientId);
                            const isExpired = p?.insurance?.available && p.insurance.validTill && new Date(p.insurance.validTill) < new Date();
                            
                            return (
                              <>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-lg font-bold text-gray-900">{p?.name}</p>
                                    <p className="text-sm text-gray-600">Age: {p?.age} • Gender: {p?.gender}</p>
                                  </div>
                                  {p?.insurance?.available ? (
                                    <Badge variant={isExpired ? 'danger' : 'success'}>
                                      {isExpired ? 'Policy Expired ❌' : 'Insured ✅'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="danger">No Insurance ❌</Badge>
                                  )}
                                </div>

                                {p?.insurance?.available && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <p className="text-gray-400 font-bold uppercase">Company</p>
                                      <p className="text-gray-900 font-medium">{p.insurance.company}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 font-bold uppercase">Policy #</p>
                                      <p className="text-gray-900 font-medium">{p.insurance.policyNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 font-bold uppercase">Valid Till</p>
                                      <p className={cn("font-medium", isExpired ? "text-red-600" : "text-gray-900")}>
                                        {p.insurance.validTill}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 font-bold uppercase">Plan Type</p>
                                      <p className={cn("font-bold", p.insurance.plan === 'Premium' ? "text-purple-600" : "text-blue-600")}>
                                        {p.insurance.plan}
                                      </p>
                                    </div>
                                    {p.insurance.coverageAmount !== undefined && (
                                      <div>
                                        <p className="text-gray-400 font-bold uppercase">Coverage</p>
                                        <p className="text-gray-900 font-medium">{p.insurance.coverageAmount}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pain History</p>
                                  <p className="text-sm text-gray-700">{p?.painHistory}</p>
                                </div>
                                
                                {(p?.reports?.xray || p?.reports?.mri || p?.reports?.labReport) && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">📋 Medical Records</p>
                                    <div className="space-y-2">
                                      {p?.reports?.xray && (
                                        <a href={p.reports.xray} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-blue-50 rounded-lg hover:bg-blue-100">
                                          <span className="text-xs font-medium text-gray-700">🔬 X-Ray</span>
                                          <span className="text-xs text-blue-600">View</span>
                                        </a>
                                      )}
                                      {p?.reports?.mri && (
                                        <a href={p.reports.mri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-purple-50 rounded-lg hover:bg-purple-100">
                                          <span className="text-xs font-medium text-gray-700">🧠 MRI</span>
                                          <span className="text-xs text-purple-600">View</span>
                                        </a>
                                      )}
                                      {p?.reports?.labReport && (
                                        <a href={p.reports.labReport} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-green-50 rounded-lg hover:bg-green-100">
                                          <span className="text-xs font-medium text-gray-700">🧪 Lab Report</span>
                                          <span className="text-xs text-green-600">View</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </section>

                      {/* AI helper label */}
                      {(() => {
                        const qual = selectedRequest.aiAnalysis?.insuranceQuality;
                        if (!qual) return null;
                        if (qual === 'Strong') {
                          return (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mt-4">
                              <p className="text-sm font-bold text-emerald-700">AI suggests this policy is suitable for approval</p>
                            </div>
                          );
                        }
                        if (qual === 'Weak') {
                          return (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mt-4">
                              <p className="text-sm font-bold text-amber-700">AI suggests improvements needed</p>
                            </div>
                          );
                        }
                        return (
                          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                            <p className="text-sm font-medium text-gray-700">AI suggests manual review</p>
                          </div>
                        );
                      })()}

                      <section>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Policy Recommendation</h3>
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-2">
                          <div className="flex items-center gap-2 text-purple-700">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-bold text-sm">System Policy Engine</span>
                          </div>
                          {(() => {
                            const p = patients.find(p => p.id === selectedRequest.patientId);
                            const isExpired = p?.insurance?.available && p.insurance.validTill && new Date(p.insurance.validTill) < new Date();
                            const treatment = selectedRequest.treatment.toLowerCase();
                            const isScan = treatment.includes('mri') || treatment.includes('x-ray') || treatment.includes('scan') || treatment.includes('imaging');

                            if (!p?.insurance?.available) return <p className="text-sm text-red-600 font-medium">No Insurance: Reject authorization (Self-payment required).</p>;
                            if (isExpired) return <p className="text-sm text-red-600 font-medium">Policy Expired: Reject authorization immediately.</p>;
                            if (p.insurance.plan === 'Premium') return <p className="text-sm text-green-600 font-medium">Premium Plan: High probability of approval. All treatments covered.</p>;
                            if (p.insurance.plan === 'Basic') {
                              if (isScan) return <p className="text-sm text-green-600 font-medium">Basic Plan: Imaging/Scans are covered. Approval recommended.</p>;
                              return <p className="text-sm text-yellow-600 font-medium">Basic Plan: Limited coverage. Manual review required for non-imaging procedures.</p>;
                            }
                            return null;
                          })()}
                        </div>
                      </section>

                      {/* Cost Estimation Display */}
                      {(selectedRequest.aiAnalysis?.estimated_treatment_cost || selectedRequest.estimated_treatment_cost) && (
                        <section>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Cost Estimation</h3>
                          <div className="space-y-3">
                            <div className="p-4 bg-white/50 border border-gray-100 rounded-xl">
                              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Estimated Treatment Cost</p>
                              <p className="text-2xl font-black text-green-600">{selectedRequest.aiAnalysis?.estimated_treatment_cost || selectedRequest.estimated_treatment_cost || '—'}</p>
                              <p className="text-xs text-gray-500 mt-1">Total estimated cost of the procedure</p>
                            </div>
                            <div className="p-4 bg-white/50 border border-gray-100 rounded-xl">
                              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Estimated Insurance Coverage</p>
                              <p className="text-2xl font-black text-blue-600">{selectedRequest.aiAnalysis?.estimated_approved_amount || selectedRequest.estimated_approved_amount || '—'}</p>
                              <p className="text-xs text-gray-500 mt-1">Estimated amount insurance may cover</p>
                            </div>
                            {(() => {
                              const approvedStr = selectedRequest.aiAnalysis?.estimated_approved_amount || selectedRequest.estimated_approved_amount || '';
                              const approvedNum = parseInt(approvedStr.replace(/₹|,/g, ''), 10) || 0;
                              const treatmentStr = selectedRequest.aiAnalysis?.estimated_treatment_cost || selectedRequest.estimated_treatment_cost || '';
                              const treatmentNum = parseInt(treatmentStr.replace(/₹|,/g, ''), 10) || 100000;
                              
                              let coverageLabel = '';
                              let coverageEmoji = '';
                              let coverageStyle = '';
                              
                              if (approvedNum === 0) {
                                coverageLabel = 'No Coverage';
                                coverageEmoji = '❌';
                                coverageStyle = 'bg-red-50 border-red-200 text-red-700';
                              } else if (approvedNum >= treatmentNum * 0.8) {
                                coverageLabel = 'Good Coverage';
                                coverageEmoji = '✅';
                                coverageStyle = 'bg-green-50 border-green-200 text-green-700';
                              } else if (approvedNum > 0) {
                                coverageLabel = 'Limited Coverage';
                                coverageEmoji = '⚠️';
                                coverageStyle = 'bg-yellow-50 border-yellow-200 text-yellow-700';
                              }
                              
                              return (
                                <div className={cn('p-4 border rounded-xl font-bold text-center text-lg', coverageStyle)}>
                                  {coverageEmoji} {coverageLabel}
                                </div>
                              );
                            })()}
                          </div>
                        </section>
                      )}
                      
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">AI Analysis Summary</h3>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 text-blue-700">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="font-bold text-sm">Gemini AI Insights</span>
                          </div>
                          <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-bold text-blue-600 uppercase">Medical Summary</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedRequest.aiAnalysis?.medicalSummary?.condition}</p>
                                  <p className="text-xs text-gray-500">Severity: {selectedRequest.aiAnalysis?.medicalSummary?.severity}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-blue-600 uppercase">Approval Probability</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedRequest.aiAnalysis?.approvalProbability ?? '—'}%</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-blue-600 uppercase">Policy Strength</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedRequest.aiAnalysis?.insuranceQuality || '—'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-100">
                                  <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs font-bold text-green-600 uppercase">Est. Treatment Cost</p>
                                    <p className="text-base font-bold text-gray-900 mt-1">{selectedRequest.aiAnalysis?.estimated_treatment_cost || '—'}</p>
                                  </div>
                                  <div className="p-3 bg-white rounded-lg">
                                    <p className="text-xs font-bold text-blue-600 uppercase">Est. Approved Amount</p>
                                    <p className="text-base font-bold text-gray-900 mt-1">{selectedRequest.aiAnalysis?.estimated_approved_amount || '—'}</p>
                                  </div>
                                </div>
                                {(() => {
                                  const approvedStr = selectedRequest.aiAnalysis?.estimated_approved_amount || '';
                                  const approvedNum = parseInt(approvedStr.replace(/₹|,/g, ''), 10) || 0;
                                  const treatmentStr = selectedRequest.aiAnalysis?.estimated_treatment_cost || '';
                                  const treatmentNum = parseInt(treatmentStr.replace(/₹|,/g, ''), 10) || 100000;
                                  
                                  let coverage = '';
                                  let coverageIcon = '';
                                  let coverageColor = '';
                                  
                                  if (approvedNum === 0) {
                                    coverage = 'No Coverage';
                                    coverageIcon = '❌';
                                    coverageColor = 'bg-red-50 border-red-100 text-red-700';
                                  } else if (approvedNum >= treatmentNum * 0.8) {
                                    coverage = 'Good Coverage';
                                    coverageIcon = '✅';
                                    coverageColor = 'bg-green-50 border-green-100 text-green-700';
                                  } else if (approvedNum > 0) {
                                    coverage = 'Limited Coverage';
                                    coverageIcon = '⚠️';
                                    coverageColor = 'bg-yellow-50 border-yellow-100 text-yellow-700';
                                  }
                                  
                                  return (
                                    <div className={cn('p-3 rounded-lg border font-medium text-sm mt-3', coverageColor)}>
                                      {coverageIcon} {coverage}
                                    </div>
                                  );
                                })()}
                                <div>
                                  <p className="text-xs font-bold text-blue-600 uppercase">AI Insights</p>
                                  <div className="text-sm text-gray-900">
                                    <p className="font-medium">Positive:</p>
                                    <ul className="list-disc pl-5 text-sm">
                                      {(selectedRequest.aiAnalysis?.positiveInsights || []).map((it: string, i: number) => <li key={i}>{it}</li>)}
                                    </ul>
                                    <p className="font-medium mt-2">Negative:</p>
                                    <ul className="list-disc pl-5 text-sm">
                                      {(selectedRequest.aiAnalysis?.negativeInsights || []).map((it: string, i: number) => <li key={i}>{it}</li>)}
                                    </ul>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-blue-600 uppercase">Improvement Suggestions</p>
                                  <ul className="list-disc pl-5 text-sm text-gray-900">
                                    {(selectedRequest.aiAnalysis?.improvementSuggestions || []).map((it: string, i: number) => <li key={i}>{it}</li>)}
                                  </ul>
                                </div>
                          </div>
                        </div>
                      </section>

                      {selectedRequest.status === 'pending' && (
                        <section className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Decision</h3>
                          <textarea 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[100px]"
                            placeholder="Enter rejection reason if applicable..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                          />
                          <div className="flex gap-3">
                            <Button variant="danger" className="flex-1" onClick={() => handleAction('rejected')}>Reject ❌</Button>
                            <Button variant="success" className="flex-1" onClick={() => handleAction('approved')}>Approve ✅</Button>
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export const PolicyManagement: React.FC = () => {
  const { policies, addPolicy, togglePolicy } = useAppContext();
  const [newRule, setNewRule] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule) return;
    addPolicy(newRule);
    setNewRule('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-gray-500">Define and manage insurance approval rules.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Active Policies">
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", policy.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <p className={cn("text-sm font-medium", policy.active ? "text-gray-900" : "text-gray-400 line-through")}>
                        {policy.rule}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => togglePolicy(policy.id)}>
                      {policy.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card title="Add New Policy">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Rule Description</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm min-h-[120px]"
                    required
                    value={newRule}
                    onChange={e => setNewRule(e.target.value)}
                    placeholder="e.g., Approve surgery if pain > 6 months AND MRI available"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="w-4 h-4" />
                  Add Policy
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

