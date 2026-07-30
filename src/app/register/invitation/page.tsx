"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { invitationsService } from "@/services/invitations";
import type { InvitationTokenInfo } from "@/types";

type PageState = "loading" | "form" | "invalid" | "used" | "expired" | "success";

export default function InvitacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [tokenInfo, setTokenInfo] = useState<InvitationTokenInfo | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    invitationsService.validateToken(token).then((result) => {
      if (result.status === "ok") {
        setTokenInfo(result.data);
        setFirstName(result.data.firstName ?? "");
        setLastName(result.data.lastName ?? "");
        setPageState("form");
      } else {
        setPageState(result.status); // 'invalid' | 'used' | 'expired'
      }
    });
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await invitationsService.completeRegistration({ token, firstName, lastName, password });
      router.push("/login?invited=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al completar el registro");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4" />
          <p className="text-sand-600">Validando enlace...</p>
        </div>
      </div>
    );
  }

  // ── Error states ──────────────────────────────────────────────────────────

  const errorConfig: Record<"invalid" | "used" | "expired", { icon: string; title: string; desc: string }> = {
    invalid: {
      icon: "❌",
      title: "Enlace inválido",
      desc: "Este enlace de invitación no es válido. Verifica que lo hayas copiado correctamente.",
    },
    used: {
      icon: "✅",
      title: "Enlace ya utilizado",
      desc: "Este enlace ya fue usado para crear una cuenta. Si olvidaste tu contraseña, puedes recuperarla desde el login.",
    },
    expired: {
      icon: "⏰",
      title: "Enlace expirado",
      desc: "Este enlace de invitación ha vencido. Solicita una nueva invitación al administrador.",
    },
  };

  if (pageState in errorConfig) {
    const cfg = errorConfig[pageState as "invalid" | "used" | "expired"];
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
        <div className="max-w-md w-full rounded-2xl border border-sand-300 bg-white p-8 text-center space-y-4">
          <div className="text-5xl">{cfg.icon}</div>
          <h1 className="text-xl font-bold text-ink">{cfg.title}</h1>
          <p className="text-sand-700 text-sm">{cfg.desc}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Image src="/construir-logo.png" alt="Construir" width={140} height={40} className="mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-ink">Completa tu registro</h2>
          <p className="mt-1 text-sm text-sand-600">
            Has sido invitado a crear una cuenta.
          </p>
        </div>

        <div className="rounded-2xl border border-sand-300 bg-white p-8 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">Email</label>
            <div className="px-3 py-2 bg-sand-50 border border-sand-300 rounded-lg text-sand-700 text-sm">
              {tokenInfo?.email}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-danger-50 p-3">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
              <p className="mt-1 text-xs text-sand-500">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
