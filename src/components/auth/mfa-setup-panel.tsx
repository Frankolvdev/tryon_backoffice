"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  Check,
  Clipboard,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminMfaOperationResponse,
  AdminMfaSetupResponse,
} from "@/types/auth";

export function MfaSetupPanel() {
  const router = useRouter();

  const [setup, setSetup] =
    useState<AdminMfaSetupResponse | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] =
    useState(false);

  const loadSetup = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<AdminMfaSetupResponse>(
          "/api/auth/mfa/setup",
          {
            method: "POST",
          },
        );

      setSetup(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible iniciar la configuración MFA.";

      setSetup(null);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  const copyRecoveryCodes = async () => {
    if (!setup) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        setup.recovery_codes.join("\n"),
      );

      toast.success(
        "Códigos de recuperación copiados.",
      );
    } catch {
      toast.error(
        "No fue posible copiar los códigos.",
      );
    }
  };

  const confirmSetup = async () => {
    const normalizedCode = code
      .trim()
      .replace(/\s+/g, "");

    if (normalizedCode.length < 6) {
      toast.error(
        "Escribe el código de seis dígitos del autenticador.",
      );

      return;
    }

    setIsConfirming(true);

    try {
      const response =
        await browserApiRequest<AdminMfaOperationResponse>(
          "/api/auth/mfa/confirm",
          {
            method: "POST",
            body: JSON.stringify({
              code: normalizedCode,
            }),
          },
        );

      toast.success(response.message);

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible confirmar MFA.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4">
        <LoaderCircle className="animate-spin text-red-500" />

        <p className="text-sm text-zinc-500">
          Preparando autenticación MFA...
        </p>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 text-red-500">
          <TriangleAlert size={28} />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          No se pudo cargar la configuración MFA
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
          {errorMessage ??
            "El backoffice no recibió la configuración del backend."}
        </p>

        <button
          type="button"
          onClick={() => void loadSetup()}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <RefreshCcw size={16} />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-white/8 bg-black/30 p-5">
        <p className="text-xs font-semibold tracking-[0.24em] text-red-500 uppercase">
          Paso 1
        </p>

        <h2 className="mt-3 text-xl font-semibold text-white">
          Escanea el código QR
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Usa Google Authenticator, Microsoft
          Authenticator, Authy o cualquier aplicación
          compatible con TOTP.
        </p>

        <div className="mt-6 flex justify-center rounded-2xl bg-white p-5">
          <QRCodeSVG
            value={setup.provisioning_uri}
            size={210}
            level="M"
          />
        </div>

        <div className="mt-5 rounded-xl border border-white/8 bg-black/40 p-4">
          <p className="text-xs text-zinc-600">
            Clave manual
          </p>

          <p className="mt-2 break-all font-mono text-xs text-zinc-300">
            {setup.secret}
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
          <p className="text-xs font-semibold tracking-[0.24em] text-red-500 uppercase">
            Paso 2
          </p>

          <h2 className="mt-3 text-xl font-semibold text-white">
            Guarda tus códigos de recuperación
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Cada código se utiliza una sola vez. Guárdalos
            en un lugar seguro antes de continuar.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {setup.recovery_codes.map(
              (recoveryCode) => (
                <div
                  key={recoveryCode}
                  className="rounded-lg border border-white/8 bg-black/50 px-3 py-2 text-center font-mono text-xs text-zinc-300"
                >
                  {recoveryCode}
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => void copyRecoveryCodes()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
          >
            <Clipboard size={15} />
            Copiar códigos
          </button>
        </div>

        <div className="rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={20}
              className="text-red-400"
            />

            <h2 className="text-lg font-semibold text-white">
              Confirmar autenticador
            </h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Escribe el código de seis dígitos que muestra tu
            aplicación.
          </p>

          <input
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={12}
            placeholder="000000"
            className="mt-5 h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-center font-mono text-lg tracking-[0.35em] text-white outline-none transition focus:border-red-600/70 focus:ring-4 focus:ring-red-950/40"
          />

          <button
            type="button"
            disabled={isConfirming}
            onClick={() => void confirmSetup()}
            className="luxia-red-glow mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-700 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Check size={17} />
            )}

            Activar MFA
          </button>
        </div>
      </section>
    </div>
  );
}