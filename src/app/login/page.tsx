import type { Metadata } from "next";

import {
  Activity,
  Database,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { appConfig } from "@/config/app";

export const metadata: Metadata = {
  title: "Acceso administrativo",
};

const securityItems = [
  {
    icon: ShieldCheck,
    label: "Control administrativo",
  },
  {
    icon: LockKeyhole,
    label: "Sesión protegida",
  },
  {
    icon: Activity,
    label: "Auditoría activa",
  },
  {
    icon: Database,
    label: "Datos en tiempo real",
  },
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303]">
      <div className="luxia-grid-background pointer-events-none absolute inset-0 opacity-40" />

      <div className="pointer-events-none absolute -top-48 -left-48 size-[620px] rounded-full bg-red-950/20 blur-[130px]" />

      <div className="pointer-events-none absolute -right-52 -bottom-64 size-[720px] rounded-full bg-red-950/10 blur-[150px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/5 lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20">
          <div>
            <div className="flex items-center gap-4">
              <div className="luxia-red-glow flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30">
                <Sparkles
                  size={24}
                  className="text-red-400"
                />
              </div>

              <div>
                <p className="text-xl font-semibold tracking-[0.22em] text-white">
                  {appConfig.name}
                </p>

                <p className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-red-500 uppercase">
                  AI Fashion Studio
                </p>
              </div>
            </div>

            <div className="mt-28 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.32em] text-red-500 uppercase">
                Centro de control
              </p>

              <h1 className="luxia-text-gradient mt-6 text-5xl leading-[1.05] font-semibold xl:text-7xl">
                Inteligencia,
                <br />
                control y creatividad.
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-zinc-500 xl:text-lg">
                Gestiona usuarios, operaciones de IA,
                facturación, seguridad y observabilidad
                desde una única plataforma administrativa.
              </p>
            </div>
          </div>

          <div className="grid max-w-2xl grid-cols-2 gap-3">
            {securityItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-4 backdrop-blur"
                >
                  <Icon
                    size={17}
                    className="text-red-500"
                  />

                  <span className="text-xs text-zinc-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
          <div className="w-full max-w-[460px]">
            <div className="mb-10 flex items-center gap-4 lg:hidden">
              <div className="luxia-red-glow flex size-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30">
                <Sparkles
                  size={22}
                  className="text-red-400"
                />
              </div>

              <div>
                <p className="text-lg font-semibold tracking-[0.2em] text-white">
                  {appConfig.name}
                </p>

                <p className="text-[9px] font-semibold tracking-[0.28em] text-red-500 uppercase">
                  Backoffice
                </p>
              </div>
            </div>

            <div className="luxia-panel rounded-[28px] p-6 sm:p-9">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
                <LockKeyhole size={23} />
              </div>

              <p className="mt-7 text-xs font-semibold tracking-[0.28em] text-red-500 uppercase">
                Acceso restringido
              </p>

              <h2 className="mt-3 text-3xl font-semibold text-white">
                Bienvenido de nuevo
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Utiliza una cuenta con permisos de
                administrador o superadministrador.
              </p>

              <LoginForm />
            </div>

            <p className="mt-7 text-center text-xs leading-5 text-zinc-700">
              Todos los accesos y acciones administrativas
              quedan registrados por el sistema de auditoría.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}