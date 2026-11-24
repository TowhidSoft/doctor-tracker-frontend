"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { Eye, EyeOff, Lock, Mail, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/features/auth";
import { useLoginUserMutation } from "@/redux/service/auth/authApi";
import { getErrorMessage } from "@/lib/errors";
import { DEMO_EMAIL, DEMO_PASSWORD, IS_DEMO } from "@/lib/demo/config";

/** Reads exp/iat from the access token so the auth slice knows when it expires. */
const decodeToken = (token: string): { exp: number; iat: number } | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { exp: payload.exp, iat: payload.iat };
  } catch {
    return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginUserMutation();

  const [email, setEmail] = useState(IS_DEMO ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(IS_DEMO ? DEMO_PASSWORD : "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.warning("Enter both your email and password.");
      return;
    }

    try {
      const { data } = await login({ email: email.trim(), password }).unwrap();
      const decoded = decodeToken(data.accessToken);
      if (!decoded) throw new Error("The server returned an invalid token.");
      if (data.role !== "ADMIN") throw new Error("This portal is for administrators only.");

      dispatch(
        setUser({
          user: { userId: data.id, email: data.email, role: data.role, exp: decoded.exp, iat: decoded.iat },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      // src/middleware.ts reads this cookie to guard /dashboard/*; it expires with the 7-day token.
      Cookies.set("accessToken", data.accessToken, { expires: 7, sameSite: "lax" });
      Cookies.set("refreshToken", data.refreshToken, { expires: 7, sameSite: "lax" });

      toast.success("Signed in");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error && !("data" in error) ? error.message : getErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
            <Stethoscope size={22} />
          </span>
          <div>
            <h1 className="font-poppins text-2xl font-semibold text-secondary-dark">Doctor Tracker</h1>
            <p className="text-sm text-text-secondary">Sign in to the admin portal</p>
          </div>
        </div>

        {IS_DEMO && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo mode: sample data stored in this browser, no server needed. Credentials are pre-filled.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-secondary-dark">Email</span>
            <span className="relative block">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full rounded-lg border border-[#D9D9D9] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-secondary-dark">Password</span>
            <span className="relative block">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#D9D9D9] py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-[#1E4A9A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
