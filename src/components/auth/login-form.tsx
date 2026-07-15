"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  BrowserApiError,
  browserApiRequest,
} from "@/lib/api/browser-api";

import type { AdminLoginResponse } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [requiresMfa, setRequiresMfa] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const validateForm = (): string | null => {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return "El correo electrónico es obligatorio.";
    }

    if (
      !normalizedEmail.includes("@") ||
      !normalizedEmail.includes(".")
    ) {
      return "Escribe un correo electrónico válido.";
    }

    if (!password) {
      return "La contraseña es obligatoria.";
    }

    if (
      requiresMfa &&
      mfaCode.trim().length < 6
    ) {
      return "Escribe un código MFA válido.";
    }

    return null;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await browserApiRequest<AdminLoginResponse>(
          "/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
              mfa_code:
                mfaCode.trim() || null,
            }),
          },
        );

      toast.success(
        "Acceso administrativo autorizado.",
      );

      if (response.mfa_setup_required) {
        router.replace("/mfa/setup");
      } else {
        router.replace("/dashboard");
      }

      router.refresh();
    } catch (error) {
      if (
        error instanceof BrowserApiError &&
        error.code === "MFA_REQUIRED"
      ) {
        setRequiresMfa(true);

        const message =
          "Introduce el código de tu aplicación de autenticación.";

        setErrorMessage(message);
        toast.info(message);

        return;
      }

      let message =
        "No fue posible iniciar sesión.";

      if (error instanceof BrowserApiError) {
        if (error.status === 401) {
          message =
            "El correo electrónico o la contraseña son incorrectos.";
        } else if (error.status === 403) {
          message =
            "Esta cuenta no tiene acceso al backoffice.";
        } else {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={handleSubmit}
      noValidate
    >
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <p className="text-sm leading-6 text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Correo electrónico
        </label>

        <div className="relative">
          <Mail
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-600"
          />

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);

              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            autoComplete="username"
            placeholder="administrador@luxia.dev"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pr-4 pl-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600/70 focus:ring-4 focus:ring-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-300"
          >
            Contraseña
          </label>

          <span className="text-xs text-zinc-600">
            Acceso protegido
          </span>
        </div>

        <div className="relative">
          <LockKeyhole
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-600"
          />

          <input
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);

              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            autoComplete="current-password"
            placeholder="••••••••••••"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pr-12 pl-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600/70 focus:ring-4 focus:ring-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            disabled={isSubmitting}
            className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={
              showPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      {requiresMfa && (
        <div className="rounded-2xl border border-red-500/15 bg-red-950/10 p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-950/30 text-red-400">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Verificación de dos factores
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Introduce el código vigente de tu
                aplicación de autenticación.
              </p>
            </div>
          </div>

          <label
            htmlFor="mfaCode"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Código MFA o recuperación
          </label>

          <div className="relative">
            <KeyRound
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-600"
            />

            <input
              id="mfaCode"
              name="mfaCode"
              type="text"
              value={mfaCode}
              onChange={(event) => {
                setMfaCode(event.target.value);

                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={100}
              disabled={isSubmitting}
              placeholder="000000"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pr-4 pl-12 font-mono text-sm tracking-[0.22em] text-white outline-none transition placeholder:text-zinc-700 focus:border-red-600/70 focus:ring-4 focus:ring-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="luxia-red-glow flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Verificando acceso
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            Entrar al backoffice
          </>
        )}
      </button>
    </form>
  );
}