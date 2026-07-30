"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/auth/AuthShell";
import { authService } from "@/services/auth";
import { getDefaultAdminPath } from "@/lib/permissions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordReset = searchParams.get("reset") === "success";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const user = await login({ email, password });
      router.push(getDefaultAdminPath(user.role));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (msg === "Email not verified") {
        setEmailNotVerified(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification(email);
      setResendSuccess(true);
    } catch {
      // API always returns 200 for this endpoint, errors are unlikely
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthShell active="login">
      <div>
          {/* Password reset success banner */}
          {passwordReset && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-success-50 border border-success-100 px-4 py-3">
              <svg className="w-5 h-5 text-success-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-success-700">Contraseña actualizada correctamente. Ya puedes iniciar sesión.</p>
            </div>
          )}

          {/* Email not verified banner */}
          {emailNotVerified && (
            <div className="mb-6 rounded-lg bg-accent-50 border border-accent-100 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-accent-700">Correo no verificado</p>
                  <p className="text-sm text-accent-700 mt-0.5">
                    Debes verificar tu correo antes de iniciar sesión.
                    Revisa tu bandeja de entrada.
                  </p>
                </div>
              </div>
              {resendSuccess ? (
                <p className="text-sm text-success-700 bg-success-50 rounded-md px-3 py-2">
                  Enlace enviado. Revisa tu correo.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !email}
                  className="text-sm font-medium text-accent-700 hover:text-accent-700 underline underline-offset-2 disabled:opacity-50 transition-colors"
                >
                  {resendLoading ? "Enviando..." : "Reenviar enlace de verificación"}
                </button>
              )}
            </div>
          )}

          {/* Generic error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-danger-50 border border-danger-100 px-4 py-3">
              <svg className="w-5 h-5 text-danger-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="block min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="block pr-11 min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sand-500 hover:text-sand-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[12px] font-bold text-brand-600 transition-colors hover:text-brand-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

        {/* Comprar sin cuenta */}
        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold text-sand-500">
          <span className="h-px flex-1 bg-sand-300" />
          o
          <span className="h-px flex-1 bg-sand-300" />
        </div>

        <Link
          href="/productos"
          className="flex min-h-11 w-full items-center justify-center rounded-xl border-[1.5px] border-ink py-3.5 text-sm font-bold text-ink transition-colors hover:bg-sand-100"
        >
          Continuar como invitado
        </Link>
        <p className="mt-3 text-center text-[11.5px] font-medium leading-[1.55] text-sand-600">
          Puedes comprar sin cuenta: la creamos automáticamente al confirmar tu primer pedido.
        </p>
      </div>
    </AuthShell>
  );
}
