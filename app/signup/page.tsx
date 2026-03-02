"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  signupWithEmail,
  verifyOtp, 
  socialLogin,
  setEmail,
  setOtp,
  setStep,
  clearError,
  clearOtp
} from "@/lib/redux/features/auth/authSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { 
    step, 
    email: reduxEmail, 
    otp, 
    loading, 
    error 
  } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle OTP verification success
  useEffect(() => {
    const handleRedirect = async () => {
      const result = await dispatch(verifyOtp({ 
        email: reduxEmail, 
        otp: otp.join(""),
        name: formData.name 
      }));
      
      if (verifyOtp.fulfilled.match(result)) {
        router.push(result.payload.redirect);
      }
    };
  }, [dispatch, reduxEmail, otp, formData.name, router]);

  const handleOtpChange = (value: string, index: number) => {
    dispatch(setOtp({ index, value }));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      return;
    }

    const result = await dispatch(signupWithEmail({ 
      email: formData.email, 
      name: formData.name 
    }));
    
    if (signupWithEmail.fulfilled.match(result)) {
      dispatch(setEmail(formData.email));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.join("").length !== 6) {
      return;
    }

    const result = await dispatch(verifyOtp({ 
      email: reduxEmail, 
      otp: otp.join(""),
      name: formData.name,
      isSignup: true
    }));
    
    if (verifyOtp.fulfilled.match(result)) {
      router.push(result.payload.redirect);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const result = await dispatch(socialLogin(provider));
    
    if (socialLogin.fulfilled.match(result)) {
      router.push(result.payload.redirect);
    }
  };

  const handleBackToEmail = () => {
    dispatch(setStep('email'));
    dispatch(clearOtp());
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-[#e8f0f7] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#fdfdfe] to-[#d6e4f0] flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full sm:max-w-[460px] bg-white p-6 sm:p-10 md:p-12 rounded-[30px] sm:rounded-[45px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        
        {/* LOGO */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#5D5FEF]/10 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-3 sm:p-4 rounded-full shadow-lg border-2 border-[#5D5FEF]/20 transition-all hover:scale-110 hover:shadow-xl hover:border-[#5D5FEF]/40 duration-300">
              <div className="transition-transform duration-300 hover:scale-110">
                <Image
                  src="/Flow_logo_.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d0c22] tracking-tight mb-2 sm:mb-3">
            {step === "email" ? "Create account" : "Enter passcode"}
          </h1>
          <p className="text-[#6e6d7a] text-sm sm:text-[15px] font-medium">
            {step === "email" 
              ? "Join thousands of trendsetters in the Flow today"
              : `Sent to ${reduxEmail || formData.email}`}
          </p>
        </div>

        {step === "email" ? (
          <div className="animate-in fade-in duration-700">
            {/* SOCIAL BUTTONS */}
            <div className="flex flex-col gap-3 mb-6 sm:mb-8">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 border border-transparent rounded-[18px] font-bold text-white bg-[#4285f4] hover:bg-[#357ae8] transition-all shadow-md text-sm sm:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  className="w-4 h-4 sm:w-5 sm:h-5 brightness-200"
                  alt="Google"
                />
                Sign up with Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 border border-transparent rounded-[18px] font-bold text-white bg-[#24292f] hover:bg-[#1a1e22] transition-all shadow-md text-sm sm:text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github size={18} className="sm:w-5 sm:h-5" />
                Sign up with GitHub
              </button>
            </div>

            <div className="relative flex items-center mb-8 sm:mb-10">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="mx-4 text-[#9e9ea7] text-xs sm:text-[14px] font-bold uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={handleInitialSubmit}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-[14px] font-bold text-[#1a1c2e] ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Name here"
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 bg-[#f8f9fb] border-transparent rounded-[15px] sm:rounded-[18px] text-sm sm:text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#4285f4] transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-[14px] font-bold text-[#1a1c2e] ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="hello@example.com"
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 bg-[#f8f9fb] border-transparent rounded-[15px] sm:rounded-[18px] text-sm sm:text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#4285f4] transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm font-bold text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-[#14162e] text-white rounded-[18px] sm:rounded-[20px] font-bold text-[16px] sm:text-[17px] shadow-xl hover:bg-[#1f2142] transition-all active:scale-[0.98] disabled:bg-gray-300 mt-4"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-8 sm:space-y-10"
            >
              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full h-12 sm:h-16 text-center text-xl sm:text-2xl font-black bg-[#f8f9fb] border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-white focus:border-[#4285f4] outline-none transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm font-bold text-center">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-[#14162e] text-white rounded-[18px] sm:rounded-[20px] font-bold text-[16px] sm:text-[17px] shadow-xl active:scale-95 transition-all disabled:bg-gray-300"
                >
                  {loading ? "Verifying..." : "Verify & Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="w-full text-[11px] sm:text-xs font-bold text-[#6e6d7a] hover:text-black transition-colors uppercase tracking-widest"
                >
                  Use a different email
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="mt-8 sm:mt-12 text-center text-sm sm:text-[15px] text-[#6e6d7a] font-medium">
          {step === "email" ? "Already have an account?" : "Changed your mind?"}{" "}
          <Link
            href={step === "email" ? "/login" : "/signup"}
            className="text-[#d9a34a] font-bold hover:underline"
          >
            {step === "email" ? "Sign in" : "Back to sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}