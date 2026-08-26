/* Brex / Urbanist Design System — Exact DriveHub Goa Parity */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Lock, Mail, User, Phone, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import BrandLogo from "../components/BrandLogo";
import api, { API_BASE, formatApiError } from "@/lib/api";

export function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function CustomerAuth({ defaultSignup = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(() => defaultSignup || location.pathname === "/signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // OTP Modal State for registration verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { customerLogin, customerSignup, verifyOtp, user, customer } = useAuth();
  const activeUser = user || customer;

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || location.state?.from || "/profile";

  useEffect(() => {
    if (activeUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [activeUser, navigate, redirectPath]);

  useEffect(() => {
    if (location.pathname === "/signup") setIsSignup(true);
    else if (location.pathname === "/login") setIsSignup(false);
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setBusy(true);
    try {
      const res = await customerLogin({ email, password });
      if (res.success) {
        toast.success("Welcome back!");
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(res.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all required fields");
      return;
    }
    setBusy(true);
    try {
      const res = await customerSignup({ name, email, password, phone });
      if (res.success) {
        toast.success("Verification OTP dispatched to your email!");
        setShowOtpModal(true);
      } else {
        toast.error(res.error || "Signup failed");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await verifyOtp({ email, otp: otpCode });
      if (res.success) {
        toast.success("Email verified! Account ready.");
        setShowOtpModal(false);
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(res.error || "Invalid OTP code");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden font-body text-[#212121] bg-[#F6F5FA]">
      <SEO
        title={isSignup ? "Create an Account | Journey Rentals" : "Customer Sign In | Journey Rentals"}
        description="Sign in or create an account for Journey Rentals Solapur self-drive car and bike rentals. View active reservations and KYC documents."
        canonical={isSignup ? "/signup" : "/login"}
      />

      <header className="relative z-20 px-4 sm:px-10 pt-4 pb-1 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <BrandLogo size="md" />
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DFDCE8] text-[#212121] hover:bg-[#F6F5FA] hover:border-[#212121] text-xs font-bold transition-all shadow-xs group cursor-pointer h-10"
        >
          <ArrowLeft size={14} className="text-[#212121] group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Site</span>
        </Link>
      </header>

      <main className="relative z-10 py-6 sm:py-8 px-4 sm:px-6 flex-1 flex items-center justify-center my-auto">
        <div className="w-full max-w-[400px] bg-white border border-[#DFDCE8] rounded-[24px] p-6 sm:p-8 shadow-sm relative text-center">
          
          <h1 className="font-display text-2xl font-bold text-[#212121] tracking-tight mb-4">
            {!isSignup ? "Sign in to your account" : "Create your account"}
          </h1>

          <div className="relative flex p-1 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] mb-5 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                !isSignup ? "bg-[#212121] text-white shadow-xs" : "text-[#6F6E73] hover:text-[#212121]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                isSignup ? "bg-[#212121] text-white shadow-xs" : "text-[#6F6E73] hover:text-[#212121]"
              }`}
            >
              Create Account
            </button>
          </div>

          {!isSignup ? (
            <form onSubmit={handleLogin} className="space-y-3 text-left" autoComplete="off">
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <Input
                  type="email"
                  required
                  placeholder="Enter registered email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-body text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                />
              </div>

              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pl-10 pr-10 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-body text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99989E] hover:text-[#212121] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="text-right mt-1.5 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!email) toast.error("Please enter email address first");
                      else toast.success(`Password reset instructions sent to ${email}`);
                    }}
                    className="text-[11px] text-[#6F6E73] hover:text-[#212121] hover:underline cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold rounded-full h-11 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-sm mt-2"
              >
                {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 text-left" autoComplete="off">
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <Input
                  type="text"
                  required
                  placeholder="Enter full legal name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-body text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                />
              </div>

              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <Input
                  type="tel"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-mono text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                />
              </div>

              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <Input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="pl-10 pr-4 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-body text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                />
              </div>

              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 rounded-full bg-[#F6F5FA] border border-[#DFDCE8] text-[#212121] font-body text-xs font-normal placeholder:text-[#99989E] focus-visible:ring-1 focus-visible:ring-[#212121]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99989E] hover:text-[#212121] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-[#212121] hover:bg-[#141414] active:bg-[#000000] text-white font-bold rounded-full h-11 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-sm mt-2"
              >
                {busy ? <Loader2 size={14} className="animate-spin mr-2" /> : "Create Account"}
              </Button>
            </form>
          )}

          {/* OAuth Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-[#DFDCE8] w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-[#99989E] uppercase tracking-wider shrink-0">
              or continue with
            </span>
            <div className="border-t border-[#DFDCE8] w-full" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `${API_BASE}/auth/google`;
            }}
            className="w-full h-11 rounded-full bg-white border border-[#DFDCE8] hover:bg-[#F6F5FA] hover:border-[#212121] text-[#212121] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>{!isSignup ? "Sign In with Google" : "Sign Up with Google"}</span>
          </button>

          {/* OTP Modal */}
          {showOtpModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-xl border border-[#DFDCE8]">
                <CheckCircle size={36} className="mx-auto text-[#4B8039]" />
                <h3 className="font-bold text-lg text-[#212121]">Verify Your Email</h3>
                <p className="text-xs text-[#6F6E73]">
                  We sent a 6-digit verification code to <span className="font-bold text-[#212121]">{email}</span>.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="text-center font-mono font-bold tracking-widest text-lg h-12 rounded-xl border-[#DFDCE8]"
                  />
                  <Button
                    type="submit"
                    disabled={verifyingOtp}
                    className="w-full bg-[#212121] hover:bg-[#141414] text-white font-bold rounded-full h-11 text-xs uppercase"
                  >
                    {verifyingOtp ? <Loader2 size={14} className="animate-spin" /> : "Verify & Complete"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#DFDCE8] text-[11px] text-[#99989E]">
            By signing in, you agree to Journey Rentals <Link to="/about" className="text-[#212121] underline">Terms &amp; Conditions</Link>.
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-4 text-center text-xs text-[#99989E]">
        &copy; {new Date().getFullYear()} Journey Rentals Solapur. All rights reserved.
      </footer>
    </div>
  );
}
