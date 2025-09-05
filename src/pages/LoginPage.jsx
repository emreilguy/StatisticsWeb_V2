import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBaseTables from '../hooks/useBaseTables';
import { saveSession, isAllowedAuthority } from '../utils/auth';
// import useToken from '../constants/useToken';

export default function LoginPage() {
  // const { setToken } = useToken();
  const { users } = useBaseTables();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password;

    const found = (Array.isArray(users) ? users : []).find(
      (u) =>
        String(u.email || "").toLowerCase() === inputEmail &&
        String(u.password || "") === inputPass
    );

    if (!found) {
      setIsLoading(false);
      alert("Invalid credentials.");
      return;
    }

    // save session
    const session = {
      id: found.id,
      name: found.name,
      email: found.email,
      authority: found.authority,
      center_id: found.center_id || "",
    };
    saveSession(session);

    // saveSession({
    //   id: found.id,
    //   name: found.name,
    //   email: found.email,
    //   authority: found.authority,
    //   center_id: found.center_id || "",
    // });

    // route by role
    if (isAllowedAuthority(found.authority)) {
      setIsLoading(false);
      navigate("/dashboard", { replace: true });
      return;
    }
    if (session.center_id) {
      setIsLoading(false);
      navigate(`/detail/${encodeURIComponent(session.center_id)}`, { replace: true });
      return;
    }

    // normal user -> must have center_id
    if (session.center_id) {
      setIsLoading(false);
      navigate(`/detail/${encodeURIComponent(session.center_id)}`, { replace: true });
      return;
    }

    // fallback
    setIsLoading(false);
    alert("No center assigned to this user. Please contact admin.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* soft color glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59,130,246,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo image instead of text */}
          <div className="text-center mb-8">
            <img
              src="/dof-logo.png"
              alt="DOF Robotics"
              className="mx-auto h-14 w-auto object-contain"
            />

          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700/50"
                />
                <span className="ml-2 block text-sm text-slate-300">Remember me</span>
              </label>

              <button type="button" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">© 2025 DOF Robotics. All rights reserved.</p>
        </div>
      </div>

      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
    </div>
  );
}
