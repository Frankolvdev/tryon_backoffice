import type { Metadata } from "next";

import { LockKeyhole, ShieldCheck } from "lucide-react";

import { MfaSetupPanel } from "@/components/auth/mfa-setup-panel";

export const metadata: Metadata = {
  title: "Configurar MFA",
};

export default function MfaSetupPage() {
  return (
    <main className="luxia-grid-background min-h-screen px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400">
            <LockKeyhole size={22} />
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.28em] text-red-500 uppercase">
            Seguridad administrativa
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Configura la autenticación MFA
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
            Esta protección es obligatoria para las cuentas
            administrativas. Completa el proceso antes de acceder al panel.
          </p>
        </header>

        <section className="luxia-panel rounded-[28px] p-5 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-white/6 pb-6">
            <ShieldCheck className="text-red-500" />

            <div>
              <p className="font-medium text-white">
                Verificación en dos pasos
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Estándar TOTP y códigos de recuperación
              </p>
            </div>
          </div>

          <MfaSetupPanel />
        </section>
      </div>
    </main>
  );
}