"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch("password", "");

  const handleRegister = async (values: RegisterValues) => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: `${values.firstName} ${values.lastName}`,
    });

    if (authError) {
      setError(authError.message || "Registration failed");
      setIsLoading(false);
      return;
    }

    // Success! Redirect to login or dashboard
    router.push("/login");
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-relay-bg">
      <div className="w-full max-w-[440px] bg-relay-surf rounded-[14px] border border-relay-border overflow-hidden shadow-sm">
        {/* Top Header */}
        <div className="bg-relay-subtle px-[18px] py-[14px] border-b border-relay-border flex items-center justify-between">
          <span className="text-[22px] font-medium text-relay-accent tracking-[-1.2px]">relay</span>
          <div className="inline-flex items-center gap-[5px] bg-relay-subtle border border-relay-border-strong rounded-full px-[10px] py-[3px] text-[11px] text-relay-text-secondary">
            <span className="w-[6px] height-[6px] rounded-full bg-relay-accent-alt"></span>
            Step 1 of 2
          </div>
        </div>

        <div className="p-[20px]">
          {/* Tabs */}
          <div className="flex border-b border-relay-border mb-[16px]">
            <Link href="/login" className="flex-1 py-[8px] text-center text-[12.5px] font-medium text-relay-text-secondary border-b-2 border-transparent transition-colors">
              Login
            </Link>
            <div className="flex-1 py-[8px] text-center text-[12.5px] font-medium text-relay-accent border-b-2 border-relay-accent transition-colors">
              Register
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-[3px] mb-[12px]">
            <div className="h-[3px] flex-1 rounded-[2px] bg-relay-accent"></div>
            <div className="h-[3px] flex-1 rounded-[2px] bg-relay-accent"></div>
            <div className="h-[3px] flex-1 rounded-[2px] bg-relay-border"></div>
            <div className="h-[3px] flex-1 rounded-[2px] bg-relay-border"></div>
          </div>

          <div className="mb-[14px]">
            <p className="text-[13px] font-medium text-relay-text-primary mb-[3px]">Create your account</p>
            <p className="text-[11.5px] text-relay-text-secondary">Your identity, secured by Better-Auth</p>
          </div>

          {/* Social Auth */}
          <div className="flex gap-[8px] mb-[4px]">
            <button 
              onClick={() => handleSocialLogin("google")}
              className="flex-1 bg-relay-social border border-relay-border-strong rounded-[8px] py-[9px] flex items-center justify-center gap-[6px] cursor-pointer text-[11.5px] text-relay-text-primary hover:bg-relay-border transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
              <span>Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin("github")}
              className="flex-1 bg-relay-social border border-relay-border-strong rounded-[8px] py-[9px] flex items-center justify-center gap-[6px] cursor-pointer text-[11.5px] text-relay-text-primary hover:bg-relay-border transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 .2A8 8 0 0 0 5.471 15.84c.4.073.546-.174.546-.385v-1.46c-2.22.482-2.69-.944-2.69-.944-.363-.924-.887-1.17-.887-1.17-.725-.495.055-.485.055-.485.802.056 1.224.823 1.224.823.713 1.22 1.87.868 2.327.664.072-.516.278-.868.507-1.068-1.773-.201-3.636-.886-3.636-3.944 0-.872.311-1.585.822-2.144-.083-.202-.357-1.014.077-2.114 0 0 .671-.215 2.2.82A7.653 7.653 0 0 1 8 3.97c.68.003 1.365.092 2.005.27 1.528-1.035 2.198-.82 2.198-.82.435 1.1.161 1.912.079 2.114.512.56.821 1.272.821 2.144 0 3.066-1.866 3.74-3.644 3.937.287.247.542.733.542 1.477v2.19c0 .213.144.462.55.384A8 8 0 0 0 8 .2Z" fill="currentColor"/></svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-[10px] my-[14px]">
            <div className="flex-1 h-[0.5px] bg-relay-border-strong"></div>
            <span className="text-[11px] text-relay-text-secondary whitespace-nowrap">or continue with email</span>
            <div className="flex-1 h-[0.5px] bg-relay-border-strong"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(handleRegister)} className="space-y-[14px]">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="space-y-[4px]">
                <label className="text-[11.5px] font-medium text-relay-text-secondary">First name</label>
                <input
                  {...register("firstName")}
                  placeholder="Hamza"
                  className="w-full bg-relay-input border border-relay-border-strong rounded-[8px] px-[12px] py-[9px] text-[12.5px] text-relay-text-primary focus:border-relay-accent focus:bg-relay-input-focus outline-none transition-all placeholder:text-relay-text-secondary/50"
                />
                {errors.firstName && <p className="text-[10px] text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-[4px]">
                <label className="text-[11.5px] font-medium text-relay-text-secondary">Last name</label>
                <input
                  {...register("lastName")}
                  placeholder="Zahid"
                  className="w-full bg-relay-input border border-relay-border-strong rounded-[8px] px-[12px] py-[9px] text-[12.5px] text-relay-text-primary focus:border-relay-accent focus:bg-relay-input-focus outline-none transition-all placeholder:text-relay-text-secondary/50"
                />
                {errors.lastName && <p className="text-[10px] text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-[4px]">
              <label className="text-[11.5px] font-medium text-relay-text-secondary">Email address</label>
              <input
                {...register("email")}
                placeholder="you@example.com"
                className="w-full bg-relay-input border border-relay-border-strong rounded-[8px] px-[12px] py-[9px] text-[12.5px] text-relay-text-primary focus:border-relay-accent focus:bg-relay-input-focus outline-none transition-all placeholder:text-relay-text-secondary/50"
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-[4px]">
              <label className="text-[11.5px] font-medium text-relay-text-secondary">Password</label>
              <div className="relative group">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="w-full bg-relay-input border border-relay-border-strong rounded-[8px] px-[12px] py-[9px] text-[12.5px] text-relay-text-primary focus:border-relay-accent focus:bg-relay-input-focus outline-none transition-all placeholder:text-relay-text-secondary/50 pr-[36px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-relay-text-secondary hover:text-relay-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password Strength Indicator (Visual) */}
              {passwordValue.length > 0 && (
                <div className="flex gap-[2px] mt-2 items-center">
                  <div className={`h-[3px] w-[18px] rounded-[2px] ${passwordValue.length >= 4 ? "bg-relay-accent" : "bg-relay-border-strong"}`}></div>
                  <div className={`h-[3px] w-[18px] rounded-[2px] ${passwordValue.length >= 8 ? "bg-relay-accent" : "bg-relay-border-strong"}`}></div>
                  <div className={`h-[3px] w-[18px] rounded-[2px] ${passwordValue.length >= 12 ? "bg-relay-accent" : "bg-relay-border-strong"}`}></div>
                </div>
              )}
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-[7px] mt-2 px-1">
              <input
                type="checkbox"
                required
                className="mt-[3px] w-[14px] h-[14px] appearance-none border border-relay-border-strong rounded-[4px] bg-relay-input checked:bg-relay-accent checked:border-relay-accent cursor-pointer transition-all flex items-center justify-center relative after:content-['✓'] after:text-white after:text-[10px] after:hidden checked:after:block"
              />
              <span className="text-[11px] text-relay-text-secondary leading-[1.6]">
                I agree to the <Link href="/terms" className="text-relay-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-relay-accent hover:underline">Privacy Policy</Link>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-relay-btn text-relay-btn-text rounded-[9px] py-[10px] text-[13px] font-medium flex items-center justify-center gap-[6px] cursor-pointer hover:bg-relay-accent-alt transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2 shadow-sm"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-[11px] text-relay-text-secondary text-center mt-[10px]">
              Already have an account? <Link href="/login" className="text-relay-accent hover:underline transition-all">Sign in →</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
