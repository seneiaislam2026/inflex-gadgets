import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Mail, Lock, Phone, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore.ts';

export default function Login() {
  const { user, authReady } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  useEffect(() => {
    setIsSignUp(activeTab === 'register');
  }, [activeTab]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && user) {
      if (user.isAdmin) {
        navigate('/admin/orders', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, authReady, navigate]);

  if (authReady && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-emerald-500 font-black uppercase tracking-widest animate-pulse">Signing you in...</p>
        </div>
      </div>
    );
  }

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let finalEmail = email.trim().toLowerCase();
    
    // Support phone number login by appending a pseudo-domain
    if (!finalEmail.includes('@') && /^[0-9+]+$/.test(finalEmail)) {
      finalEmail = `${finalEmail}@inflex.user.com`;
    }

    const trimmedEmail = finalEmail;
    const trimmedPassword = password.trim();

    // Hardcoded Admin Check (Bootstrap Admin)
    if (trimmedEmail === 'admin@inflex.com' && trimmedPassword === 'inflex.admin@@2026') {
      try {
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        } catch (e: any) {
          if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
             try {
                userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
             } catch (createErr: any) {
                if (createErr.code === 'auth/email-already-in-use') {
                   userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
                } else {
                   throw createErr;
                }
             }
          } else {
            throw e;
          }
        }

        if (userCredential) {
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              name: 'Inflex Admin',
              email: trimmedEmail,
              role: 'admin',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } else if (userDocSnap.data()?.role !== 'admin') {
            await setDoc(userDocRef, {
              role: 'admin',
              updatedAt: new Date()
            }, { merge: true });
          }
          
          navigate('/admin/orders');
          return;
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Admin authentication failed');
        setLoading(false);
        return;
      }
    }

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          name: name || trimmedEmail.split('@')[0],
          email: trimmedEmail,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      let message = 'Authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else {
        message = err.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-slate-900/20">
              <Lock className="w-8 h-8 text-emerald-500" />
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Account Login</h1>
           <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Welcome back to Inflex Gadgets</p>
        </div>

        {/* Auth Container */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
           {/* Navigation Tabs */}
           <div className="flex bg-slate-100/50 rounded-[2rem] p-1 mb-2">
              <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Log In
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Register
              </button>
           </div>

           <div className="p-6 md:p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                   <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                   {error}
                </div>
              )}
              
              <form onSubmit={handleManualAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition font-bold text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Email or Phone Number</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="name@company.com or 017xxxxxxxx"
                      required
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition font-bold text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition font-bold text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] italic text-xs"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (activeTab === 'register' ? 'Sign Up' : 'Log In')}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center text-slate-200">
                  <div className="w-full border-t border-current"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="px-4 bg-white">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-4 px-6 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all uppercase tracking-widest"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Login with Google System
              </button>
           </div>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
           © 2026 Inflex Gadgets. All rights reserved.
        </p>
      </div>
    </div>
  );
}
