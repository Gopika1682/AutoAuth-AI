import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { Layout } from '../components/Layout';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  PlusCircle,
  BrainCircuit,
  Search,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Activity,
  Stethoscope,
  AlertCircle,
  History,
  ChevronRight,
  SearchIcon,
  Info,
  Edit
} from 'lucide-react';
import { analyzeClinicalNotes } from '../services/geminiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DoctorDashboard: React.FC = () => {
  const { requests, patients } = useAppContext();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back, manage your patients and requests.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/add-patient')}>
              <UserPlus className="w-4 h-4" />
              Add Patient
            </Button>
            <Button onClick={() => navigate('/create-request')}>
              <PlusCircle className="w-4 h-4" />
              New Request
            </Button>
          </div>
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
          <Card title="Recent Requests" subtitle="Your latest authorization submissions" variant="glass">
            <div className="space-y-3">
              {requests.slice(0, 5).map((req, index) => (
                <motion.div 
                  key={req.id} 
                  initial={{ opacity: 0, x: -10 }}
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
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{req.treatment} • {new Date(req.createdAt).toLocaleDateString()}</p>
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
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/track-requests')}>
                View All Requests <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>

          <Card title="Patient Overview" subtitle="Recently registered patients" variant="glass">
            <div className="space-y-3">
              {patients.slice(0, 5).map((patient, index) => (
                <motion.div 
                  key={patient.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{patient.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">ID: {patient.id} • {patient.age}y • {patient.gender}</p>
                      <div className="mt-1">
                        {patient.insurance?.available ? (
                          <Badge variant="success" className="text-[9px] py-0.5 px-2">Insured ✅</Badge>
                        ) : (
                          <Badge variant="danger" className="text-[9px] py-0.5 px-2">No Insurance ❌</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Edit patient" title="Edit patient" onClick={() => navigate('/add-patient', { state: { patientId: patient.id } })}>
                      <Edit className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/create-request', { state: { patientId: patient.id } })}>
                      <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {patients.length === 0 && (
                <div className="text-center py-12 text-gray-400 italic font-medium">No patients registered.</div>
              )}
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/add-patient')}>
                Register New Patient <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export const AddPatient: React.FC = () => {
  const { addPatient, updatePatient, patients } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [editingPatientId, setEditingPatientId] = React.useState<string | undefined>(location.state?.patientId as string | undefined);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    painHistory: '',
    medicalHistory: '',
    insurance: {
      available: false,
      company: '',
      policyNumber: '',
      validTill: '',
      plan: 'Basic' as 'Basic' | 'Premium',
      coverageAmount: '',
    }
  });
  const [reports, setReports] = useState({
    xray: '',
    mri: '',
    labReport: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (!editingPatientId) return;
    const p = patients.find(pt => pt.id === editingPatientId);
    if (!p) return;
    setFormData({
      name: p.name || '',
      age: p.age?.toString() ?? '',
      gender: p.gender || 'Male',
      contact: p.contact || '',
      painHistory: p.painHistory || '',
      medicalHistory: p.medicalHistory || '',
      insurance: {
        available: !!p.insurance?.available,
        company: p.insurance?.company || '',
        policyNumber: p.insurance?.policyNumber || '',
        validTill: p.insurance?.validTill || '',
        plan: p.insurance?.plan || 'Basic',
        coverageAmount: p.insurance?.coverageAmount || ''
      }
    });
    setReports({
      xray: p.reports?.xray || '',
      mri: p.reports?.mri || '',
      labReport: p.reports?.labReport || ''
    });
  }, [editingPatientId, patients]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, reportType: 'xray' | 'mri' | 'lab') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Starting file upload:', { filename: file.name, size: file.size, type: file.type, reportType });
      
      const reader = new FileReader();
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        alert('Error reading file');
      };
      
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        console.log('File read successfully, sending to server:', { dataLength: fileData.length, reportType });
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData: fileData,
              reportType: reportType
            })
          });

          console.log('Server response status:', res.status);
          const result = await res.json();
          console.log('Server response:', result);
          
          if (result.success) {
            if (reportType === 'xray') {
              setReports({ ...reports, xray: result.fileUrl });
            } else if (reportType === 'mri') {
              setReports({ ...reports, mri: result.fileUrl });
            } else if (reportType === 'lab') {
              setReports({ ...reports, labReport: result.fileUrl });
            }
            alert(`${reportType.toUpperCase()} report uploaded successfully!`);
          } else {
            alert(`Upload failed: ${result.message || 'Unknown error'}`);
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          alert('Failed to upload file');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPatientId) {
        const p = patients.find(pt => pt.id === editingPatientId);
        if (p && (p as any).db_id) {
          await updatePatient((p as any).db_id, {
            ...formData,
            age: parseInt(formData.age),
            files: [],
            insurance: formData.insurance,
            reports: reports
          });
          alert('Patient updated successfully!');
          navigate('/doctor-dashboard');
        } else {
          alert('Failed to locate patient record for editing');
        }
      } else {
        const patientId = await addPatient({
          ...formData,
          age: parseInt(formData.age),
          files: [],
          insurance: formData.insurance,
          reports: reports
        });
        setSuccess(patientId);
      }
    } catch (error) {
      alert('Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-10 text-center space-y-6" variant="glass">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Patient Registered</h2>
              <p className="text-gray-500 font-medium">
                Patient <span className="text-blue-600 font-bold">{formData.name}</span> has been added successfully with ID <span className="text-blue-600 font-bold">{success}</span>.
              </p>
              <p className="text-sm text-gray-400 mt-3">✓ Pain history, medical history, insurance, and medical records saved to database.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate('/create-request', { state: { patientId: success } })} className="flex-1">
                Create Authorization Request
              </Button>
              <Button variant="outline" onClick={() => { setSuccess(null); setFormData({ name: '', age: '', gender: 'Male', contact: '', painHistory: '', medicalHistory: '', insurance: { available: false, company: '', policyNumber: '', validTill: '', plan: 'Basic' } }); }} className="flex-1">
                Add Another Patient
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{editingPatientId ? 'Edit Patient' : 'Register New Patient'}</h1>
              <p className="text-gray-500 font-medium">Enter patient details and insurance information.</p>
            </div>
          </div>
          
          <div className="w-96 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Search & Edit Existing Patient</label>
            <div className="relative">
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                icon={<Search className="w-4 h-4" />}
              />
              {showResults && searchTerm && filteredPatients.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg max-h-56 overflow-y-auto"
                >
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                      onClick={() => { setEditingPatientId(p.id); setSearchTerm(''); setShowResults(false); }}
                    >
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-sm">{p.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.id} • {p.age}y</div>
                      </div>
                      <Edit className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            {editingPatientId && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => { 
                  setEditingPatientId(undefined); 
                  setFormData({ name: '', age: '', gender: 'Male', contact: '', painHistory: '', medicalHistory: '', insurance: { available: false, company: '', policyNumber: '', validTill: '', plan: 'Basic' } }); 
                  setReports({ xray: '', mri: '', labReport: '' }); 
                  setSearchTerm('');
                }}
              >
                + Create New Patient
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Personal Information" variant="glass" className="h-full">
              <div className="space-y-5">
                <Input
                  label="Patient Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Smith"
                  icon={<Users className="w-4 h-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Age"
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 45"
                  />
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <Input
                  label="Contact Number"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. +1 234 567 890"
                />
              </div>
            </Card>

            <Card title="Medical Background" variant="glass" className="h-full">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Pain History</label>
                  <textarea
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[100px]"
                    required
                    value={formData.painHistory}
                    onChange={(e) => setFormData({ ...formData, painHistory: e.target.value })}
                    placeholder="Describe patient's pain history..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Medical History</label>
                  <textarea
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[100px]"
                    required
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="Any previous conditions, surgeries, or medications..."
                  />
                </div>
              </div>
            </Card>
          </div>

          <Card title="Insurance Details" variant="glass">
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Insurance Coverage</p>
                  <p className="text-xs text-gray-500 font-medium">Does the patient have active insurance coverage?</p>
                </div>
                <Select
                  className="w-40"
                  value={formData.insurance.available ? 'Yes' : 'No'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    insurance: { ...formData.insurance, available: e.target.value === 'Yes' } 
                  })}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </Select>
              </div>

              {formData.insurance.available && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
                >
                  <Input
                    label="Insurance Company Name"
                    required
                    value={formData.insurance.company}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      insurance: { ...formData.insurance, company: e.target.value } 
                    })}
                    placeholder="e.g. BlueCross BlueShield"
                  />
                  <Input
                    label="Policy Number"
                    required
                    value={formData.insurance.policyNumber}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      insurance: { ...formData.insurance, policyNumber: e.target.value } 
                    })}
                    placeholder="e.g. POL-998877"
                  />
                  <Input
                    label="Valid Till"
                    type="date"
                    required
                    value={formData.insurance.validTill}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      insurance: { ...formData.insurance, validTill: e.target.value } 
                    })}
                  />
                  <Select
                    label="Plan Type"
                    value={formData.insurance.plan}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      insurance: { ...formData.insurance, plan: e.target.value as 'Basic' | 'Premium' } 
                    })}
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Premium">Premium Plan</option>
                  </Select>
                      <Input
                        label="Coverage Amount"
                        type="text"
                        value={String(formData.insurance.coverageAmount || '')}
                        onChange={(e) => setFormData({
                          ...formData,
                          insurance: { ...formData.insurance, coverageAmount: e.target.value }
                        })}
                        placeholder="e.g. 50000"
                      />
                </motion.div>
              )}
            </div>
          </Card>

          <Card title="Medical Records & Reports" variant="glass">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">🔬 X-Ray Report</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png,.gif"
                      onChange={(e) => handleFileUpload(e, 'xray')}
                      className="hidden"
                      id="xray-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('xray-upload')?.click()}
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4" />
                      {reports.xray ? 'Change File' : 'Upload File'}
                    </Button>
                  </div>
                  {reports.xray && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">File uploaded</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReports({ ...reports, xray: '' })}
                        className="h-auto p-0 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">🧠 MRI Report</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png,.gif"
                      onChange={(e) => handleFileUpload(e, 'mri')}
                      className="hidden"
                      id="mri-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('mri-upload')?.click()}
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4" />
                      {reports.mri ? 'Change File' : 'Upload File'}
                    </Button>
                  </div>
                  {reports.mri && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">File uploaded</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReports({ ...reports, mri: '' })}
                        className="h-auto p-0 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">🧪 Lab Report</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png,.gif"
                      onChange={(e) => handleFileUpload(e, 'lab')}
                      className="hidden"
                      id="lab-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('lab-upload')?.click()}
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4" />
                      {reports.labReport ? 'Change File' : 'Upload File'}
                    </Button>
                  </div>
                  {reports.labReport && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">File uploaded</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReports({ ...reports, labReport: '' })}
                        className="h-auto p-0 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {(reports.xray || reports.mri || reports.labReport) && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    📋 Uploaded Medical Records
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {reports.xray && (
                      <motion.a 
                        href={reports.xray} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm">🔬 X-Ray Report</p>
                            <p className="text-xs text-gray-500 truncate">{reports.xray}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="success" className="text-xs py-1">Uploaded</Badge>
                          <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">Open ↗</span>
                        </div>
                      </motion.a>
                    )}
                    {reports.mri && (
                      <motion.a 
                        href={reports.mri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm">🧠 MRI Report</p>
                            <p className="text-xs text-gray-500 truncate">{reports.mri}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="success" className="text-xs py-1">Uploaded</Badge>
                          <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-700">Open ↗</span>
                        </div>
                      </motion.a>
                    )}
                    {reports.labReport && (
                      <motion.a 
                        href={reports.labReport} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm">🧪 Lab Report</p>
                            <p className="text-xs text-gray-500 truncate">{reports.labReport}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge variant="success" className="text-xs py-1">Uploaded</Badge>
                          <span className="text-xs font-semibold text-green-600 group-hover:text-green-700">Open ↗</span>
                        </div>
                      </motion.a>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>Click any report card to view or download the file in a new tab.</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={loading} className="px-12">
              {editingPatientId ? 'Update Patient' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export const CreateRequest: React.FC = () => {
  const { patients, createRequest } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: location.state?.patientId || '',
    diagnosis: '',
    treatment: '',
    clinicalNotes: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });
  const [aiResult, setAiResult] = useState<any>(null);
  const [step, setStep] = useState(1);

  const [searchTerm, setSearchTerm] = useState(() => {
    const p = patients.find(p => p.id === (location.state?.patientId || ''));
    return p ? p.name : '';
  });
  const [showResults, setShowResults] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === formData.patientId);
  const isInsuranceValid = selectedPatient?.insurance?.available && 
    selectedPatient.insurance.validTill && 
    new Date(selectedPatient.insurance.validTill) > new Date();

  const handleAnalyze = async () => {
    if (!formData.clinicalNotes) return alert('Please enter clinical notes first');
    if (selectedPatient && !selectedPatient.insurance?.available) {
      return alert('Patient has no insurance. AI analysis is reserved for insurance authorization requests.');
    }
    setAiLoading(true);
    const result = await analyzeClinicalNotes(formData.clinicalNotes, selectedPatient?.reports, selectedPatient?.insurance, formData.treatment);
    setAiResult(result);
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.insurance?.available) {
      return alert('Patient has no insurance. Proceed as self-payment.');
    }
    if (!isInsuranceValid) {
      return alert('Insurance policy expired. Please update patient insurance details before submitting.');
    }
    setLoading(true);
    try {
      await createRequest({
        ...formData,
        aiAnalysis: aiResult,
        justification: aiResult?.justification || 'No justification provided',
      });
      navigate('/track-requests');
    } catch (error) {
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Prior Authorization Request</h1>
            <p className="text-gray-500 font-medium">Create a new request for insurance approval.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card title="Request Details" variant="glass" subtitle="Fill in the clinical information">
              <form className="space-y-8">
                <div className="relative space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Search Patient (Name or ID)</label>
                  <div className="relative group">
                    <Input 
                      placeholder="Search by name or PAT1001..." 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => setShowResults(true)}
                      icon={<Search className="w-4 h-4" />}
                      className="pr-12"
                    />
                  </div>
                  
                  {showResults && searchTerm && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl"
                    >
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-5 py-4 hover:bg-blue-50 flex justify-between items-center transition-all border-b border-gray-50 last:border-0 group"
                            onClick={() => {
                              setFormData({ ...formData, patientId: p.id });
                              setSearchTerm(p.name);
                              setShowResults(false);
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">{p.id}</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-6 text-sm text-gray-400 italic font-medium text-center">No patients found.</div>
                      )}
                    </motion.div>
                  )}
                </div>

                {selectedPatient && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <Users className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Patient Context</h3>
                      </div>
                      <Badge variant="info" className="font-mono">{selectedPatient.id}</Badge>
                    </div>
                    
                    {/* Insurance Status Banner */}
                    {!selectedPatient?.insurance?.available ? (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                          <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-rose-900">No Insurance Available</p>
                          <p className="text-xs text-rose-600 font-medium">Proceed as self-payment. Approval flow skipped.</p>
                        </div>
                      </div>
                    ) : !isInsuranceValid ? (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-900">Insurance Policy Expired</p>
                          <p className="text-xs text-amber-600 font-medium">Policy expired on {new Date(selectedPatient.insurance.validTill!).toLocaleDateString()}.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900">Active: {selectedPatient.insurance.company}</p>
                          <p className="text-xs text-emerald-600 font-medium">{selectedPatient.insurance.plan} Plan • Policy: {selectedPatient.insurance.policyNumber}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 block uppercase font-black tracking-widest mb-1">Age</span>
                        <span className="text-base font-bold text-gray-900">{selectedPatient.age} years</span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 block uppercase font-black tracking-widest mb-1">Gender</span>
                        <span className="text-base font-bold text-gray-900">{selectedPatient.gender}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pain History</p>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedPatient.painHistory}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Medical History</p>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedPatient.medicalHistory}</p>
                      </div>
                      {(selectedPatient.reports?.xray || selectedPatient.reports?.mri || selectedPatient.reports?.labReport) && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-3xl border-2 border-indigo-100 shadow-md"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                              <FileText className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-black text-indigo-900 uppercase tracking-wider">📋 Attached Medical Records</p>
                          </div>
                          <div className="space-y-3">
                            {selectedPatient.reports?.xray && (
                              <motion.a 
                                href={selectedPatient.reports.xray} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-indigo-100 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">🔬 X-Ray Report</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{selectedPatient.reports.xray}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">View / Download</span>
                                </div>
                              </motion.a>
                            )}
                            {selectedPatient.reports?.mri && (
                              <motion.a 
                                href={selectedPatient.reports.mri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">🧠 MRI Report</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{selectedPatient.reports.mri}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-700">View / Download</span>
                                </div>
                              </motion.a>
                            )}
                            {selectedPatient.reports?.labReport && (
                              <motion.a 
                                href={selectedPatient.reports.labReport} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-green-100 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">🧪 Lab Report</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{selectedPatient.reports.labReport}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-semibold text-green-600 group-hover:text-green-700">View / Download</span>
                                </div>
                              </motion.a>
                            )}
                          </div>
                          <p className="text-xs text-indigo-600 mt-3 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Click any report to open or download
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Diagnosis" 
                    required 
                    value={formData.diagnosis} 
                    onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
                    placeholder="e.g., Meniscus Tear" 
                    icon={<Activity className="w-4 h-4" />}
                  />
                  <Select 
                    label="Urgency Level" 
                    value={formData.urgency} 
                    onChange={e => setFormData({...formData, urgency: e.target.value as any})}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </Select>
                </div>

                <Input 
                  label="Treatment / Procedure" 
                  required 
                  value={formData.treatment} 
                  onChange={e => setFormData({...formData, treatment: e.target.value})} 
                  placeholder="e.g., Knee Arthroscopy" 
                  icon={<Stethoscope className="w-4 h-4" />}
                />

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Clinical Notes</label>
                  <textarea 
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-5 py-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[180px]"
                    required
                    value={formData.clinicalNotes}
                    onChange={e => setFormData({...formData, clinicalNotes: e.target.value})}
                    placeholder="Enter detailed clinical findings, symptoms, and previous treatments..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-14" onClick={handleAnalyze} isLoading={aiLoading}>
                    <BrainCircuit className="w-5 h-5 mr-2" />
                    AI Clinical Analysis
                  </Button>
                  <Button type="button" className="flex-1 h-14" onClick={() => setStep(2)}>
                    Review & Preview
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </Card>

            {aiResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card title="Insurance Analysis AI" variant="gradient" className="border-blue-200">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Medical Summary</p>
                      <p className="text-base text-gray-900 font-black">{aiResult.medicalSummary?.condition}</p>
                      <p className="text-sm text-gray-600">Severity: <span className="font-bold">{aiResult.medicalSummary?.severity}</span></p>
                      <p className="text-sm mt-2 text-gray-700">Treatment Needed: {aiResult.medicalSummary?.treatmentNeeded}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Policy Strength</p>
                        <p className="text-lg font-black text-gray-900">{aiResult.insuranceQuality}</p>
                      </div>
                      <div className="p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Approval Probability</p>
                        <p className="text-xl font-black text-gray-900">{aiResult.approvalProbability}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50/60 rounded-2xl border border-green-100/40 shadow-sm">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Est. Treatment Cost</p>
                        <p className="text-xl font-black text-gray-900">{aiResult.estimated_treatment_cost}</p>
                        <p className="text-[10px] text-gray-500 mt-2">Estimated procedure cost</p>
                      </div>
                      <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/40 shadow-sm">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Est. Approved Amount</p>
                        <p className="text-xl font-black text-gray-900">{aiResult.estimated_approved_amount}</p>
                        <p className="text-[10px] text-gray-500 mt-2">Estimated amount insurance may cover</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Positive Insights</p>
                      <ul className="list-disc pl-5 text-sm text-gray-800">
                        {(aiResult.positiveInsights || []).map((it: string, idx: number) => <li key={idx}>{it}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Negative Insights</p>
                      <ul className="list-disc pl-5 text-sm text-gray-800">
                        {(aiResult.negativeInsights || []).map((it: string, idx: number) => <li key={idx}>{it}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-sm font-bold">Suggestions to Improve Approval</p>
                      <ul className="list-disc pl-5 text-sm text-gray-800 mt-2">
                        {(aiResult.improvementSuggestions || []).map((it: string, idx: number) => <li key={idx}>{it}</li>)}
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">👉 Improve these details to increase insurance approval chances</p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setAiResult(null)}>Clear</Button>
                      <Button onClick={handleAnalyze} isLoading={aiLoading}>Re-run AI Analysis</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            <Card title="Request Preview" subtitle="Structured summary" variant="glass" className="sticky top-24">
              {step === 2 ? (
                <div className="space-y-8">
                  <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 space-y-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Patient</p>
                      <p className="text-lg font-black text-gray-900">{patients.find(p => p.id === formData.patientId)?.name || 'Not Selected'}</p>
                      <p className="text-xs text-blue-600 font-bold font-mono">{formData.patientId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Treatment</p>
                      <p className="text-base font-bold text-gray-900">{formData.treatment || 'Not Specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">AI Analysis Summary</p>
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-indigo-900 font-medium leading-relaxed">
                        <p className="font-bold text-sm">Approval Probability: <span className="text-lg">{aiResult?.approvalProbability ?? '—'}%</span></p>
                        <p className="mt-2">Policy Strength: <span className="font-black">{aiResult?.insuranceQuality || '—'}</span></p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="p-2 bg-white/40 rounded-lg">
                            <p className="text-xs font-bold text-indigo-700">Est. Treatment Cost</p>
                            <p className="text-lg font-black text-indigo-900">{aiResult?.estimated_treatment_cost || '—'}</p>
                          </div>
                          <div className="p-2 bg-white/40 rounded-lg">
                            <p className="text-xs font-bold text-indigo-700">Est. Approved Amount</p>
                            <p className="text-lg font-black text-indigo-900">{aiResult?.estimated_approved_amount || '—'}</p>
                          </div>
                        </div>
                        <div className="mt-3 italic text-sm">
                          "{aiResult?.justification || 'Run AI analysis to generate justification'}"
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-600">Suggestions:</p>
                          <ul className="list-disc pl-5 text-sm text-gray-800">
                            {(aiResult?.improvementSuggestions || []).slice(0,3).map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 text-lg" 
                    onClick={handleSubmit} 
                    isLoading={loading}
                    disabled={!selectedPatient?.insurance?.available || !isInsuranceValid}
                  >
                    {!selectedPatient?.insurance?.available ? 'Proceed as Self-Payment' : !isInsuranceValid ? 'Policy Expired' : 'Submit Authorization'}
                  </Button>
                  {!selectedPatient?.insurance?.available && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[11px] text-center text-gray-500 font-medium leading-relaxed">
                        Since patient has no insurance, you can proceed with treatment directly without prior authorization.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 space-y-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-200">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-gray-900">No Preview Ready</p>
                    <p className="text-sm font-medium px-6">Fill out the form and click "Review & Preview" to see the structured summary.</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const TrackRequests: React.FC = () => {
  const { requests, patients } = useAppContext();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track Requests</h1>
          <p className="text-gray-500">Monitor the status of your submitted authorization requests.</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Treatment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{patients.find(p => p.id === req.patientId)?.name}</p>
                      <p className="text-xs text-gray-500">{req.patientId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.treatment}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                      {req.adminComments || 'No comments yet'}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

