import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, Button, Input, Badge } from '../components/UI';
import { Shield, Stethoscope, UserPlus, LogIn, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin-dashboard' : '/doctor-dashboard');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-200 mb-6"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">AutoAuth</h1>
          <p className="text-gray-500 font-medium">AI-Powered Prior Authorization System</p>
        </div>

        <Card className="p-10" variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@autoauth.com"
                icon={<LogIn className="w-4 h-4" />}
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Shield className="w-4 h-4" />}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full h-14 text-lg font-bold" size="lg">
              Sign In to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-medium mb-4">Don't have an account?</p>
            <Link to="/register">
              <Button variant="outline" className="w-full h-12">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Doctor Account
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
  });
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { registerDoctor } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/login');
    }
  }, [success, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerDoctor({ ...formData, role: 'doctor' });
    if (result.success) {
      setSuccess(true);
    } else {
      alert(result.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-12 text-center space-y-6" variant="glass">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Registration Sent!</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Your account is pending admin approval. You will be redirected to login in <span className="text-blue-600 font-bold">{countdown}s</span>.
              </p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="bg-blue-600 h-full"
              />
            </div>
            <Button variant="ghost" onClick={() => navigate('/login')} className="w-full">
              Go to Login Now
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Join AutoAuth</h1>
          <p className="text-gray-500 font-medium">Create your professional doctor account</p>
        </div>

        <Card className="p-10" variant="glass">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Jane Smith"
              icon={<UserPlus className="w-4 h-4" />}
            />
            <Input
              label="Medical Specialization"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Orthopedic Surgeon"
              icon={<Stethoscope className="w-4 h-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane.smith@hospital.com"
              icon={<LogIn className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              icon={<Shield className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" size="lg">
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-medium mb-4">Already have an account?</p>
            <Link to="/login">
              <Button variant="outline" className="w-full h-12">
                Sign In Instead
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
