import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Lock, Mail, Loader2, ArrowLeft, ShieldCheck, Car, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import BrandLogo from "@/website/components/BrandLogo";

export default function AdminLogin() {
  const { owner, ownerLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (owner) {
      navigate("/admin", { replace: true });
    }
  }, [owner, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await ownerLogin(email, password);
    setBusy(false);

    if (res.success) {
      toast.success("Welcome to Journey Rentals Owner Console");
      const to = location.state?.from?.pathname || "/admin";
      navigate(to, { replace: true });
    } else {
      toast.error(res.error || "Invalid owner credentials");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between font-body text-[#212121] bg-[#F6F5FA]">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <BrandLogo size="sm" showSubtitle={false} />
        </Link>

        <Link
          to="/"
          className="text-xs font-bold text-[#6F6E73] hover:text-[#212121] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Site</span>
        </Link>
      </header>

      {/* Center Glass Admin Card */}
      <main className="max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-[28px] border border-[#DFDCE8] p-6 sm:p-8 shadow-sm text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#e1b808] text-[#212121] flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>

          <h1 className="text-2xl font-bold font-display text-[#212121]">
            Owner &amp; Admin Console
          </h1>
          <p className="text-xs text-[#6F6E73] mt-1 mb-6">
            Enter your credentials to manage Journey Rentals Solapur fleet, reservations, and analytics.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-xs font-bold text-[#6F6E73] mb-1.5">Owner Email</Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email address"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#212121] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <Label className="block text-xs font-bold text-[#6F6E73] mb-1.5">Password</Label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99989E]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#F6F5FA] border border-[#DFDCE8] text-xs font-medium text-[#212121] focus:ring-1 focus:ring-[#212121] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#99989E] hover:text-[#212121] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#212121] hover:bg-[#141414] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <span>Sign In to CRM</span>}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-[11px] text-[#99989E] font-mono">
        © {new Date().getFullYear()} Journey Rentals Solapur · Operations Management
      </footer>
    </div>
  );
}
