import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight,
  BrainCircuit,
  Zap,
  CheckCircle2,
  Activity,
  Lock,
  Clock
} from 'lucide-react';
import { Button } from '../components/UI';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900 tracking-tight">AutoAuth</span>
          </Link>
          
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-gray-600 hover:text-blue-600">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-full px-6 font-bold shadow-lg shadow-blue-200">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Home Overview) */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-blue-50/50 rounded-l-[100px] blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-indigo-50/30 rounded-r-[100px] blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Healthcare
            </div>
            
            <h1 className="text-6xl md:text-7xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight">
              Prior Authorization <br />
              <span className="text-blue-600">Reimagined.</span>
            </h1>
            
            <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
              AutoAuth bridges the gap between clinical documentation and insurance approvals using advanced AI. Reduce wait times from days to seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-xl shadow-blue-200 group">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-full border-2">
                  View Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                    <img src={`https://picsum.photos/seed/doc${i}/100/100`} alt="Provider" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500">
                Trusted by <span className="text-gray-900 font-bold">500+</span> medical facilities
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Analysis</div>
                    <div className="text-lg font-bold text-gray-900">Processing Request</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Live
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>CLINICAL EXTRACTION</span>
                    <span>98%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-2xl space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Diagnosis</div>
                    <div className="text-sm font-bold text-gray-900">Lumbar Stenosis</div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-2xl space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Status</div>
                    <div className="text-sm font-bold text-green-600">Approved</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="bg-blue-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-blue-200">
                  <div className="space-y-1">
                    <div className="text-xs font-medium opacity-80">Authorization Code</div>
                    <div className="text-xl font-bold tracking-wider">AUTH-99281-X</div>
                  </div>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full -z-10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full -z-10 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-display font-bold text-gray-900">Why AutoAuth?</h2>
            <p className="text-lg text-gray-500">
              We've built a system that understands medical necessity as well as you do, but works thousands of times faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Instant Processing",
                description: "AI analyzes clinical notes and insurance policies in real-time, providing immediate feedback."
              },
              {
                icon: <Activity className="w-6 h-6" />,
                title: "High Accuracy",
                description: "Our models are trained on millions of medical records to ensure precise policy matching."
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "HIPAA Compliant",
                description: "Enterprise-grade security ensures patient data is always protected and encrypted."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-display font-bold">Ready to automate your workflow?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join hundreds of providers who have already reclaimed their time with AutoAuth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-12 text-lg rounded-full bg-white text-blue-600 hover:bg-blue-50 border-none shadow-xl">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-lg rounded-full border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-600 w-6 h-6" />
            <span className="font-display font-bold text-xl text-gray-900">AutoAuth</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 AutoAuth AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
