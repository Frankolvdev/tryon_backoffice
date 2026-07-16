"use client";

import { KeyRound, LoaderCircle, Save, ShieldAlert, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  SelfPasswordChange,
  SelfProfileUpdate,
  SuccessResponse,
} from "@/types/profile-security";
import type { User } from "@/types/auth";

export default function MyProfilePage() {
  const { user, refreshSession, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [revoking, setRevoking] = useState(false);

  if (!user) {
    return (
      <div className="luxia-panel flex min-h-72 items-center justify-center rounded-3xl">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();

    const payload: SelfProfileUpdate = {
      email: email.trim().toLowerCase(),
      full_name: fullName.trim() || null,
    };

    setSavingProfile(true);
    try {
      await browserApiRequest<User>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await refreshSession();
      toast.success("Perfil actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible actualizar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    const payload: SelfPasswordChange = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    setSavingPassword(true);
    try {
      const response = await browserApiRequest<SuccessResponse>(
        "/api/users/me/change-password",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      toast.success(response.message);
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cambiar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  };

  const revokeSessions = async () => {
    if (!window.confirm("Se cerrarán todas tus sesiones activas. ¿Continuar?")) return;

    setRevoking(true);
    try {
      const response = await browserApiRequest<SuccessResponse>(
        "/api/users/me/revoke-sessions",
        { method: "POST" },
      );
      toast.success(response.message);
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cerrar las sesiones.");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
            <UserRound size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Cuenta
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Mi perfil
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              Administra tus datos personales, correo, contraseña y sesiones.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="luxia-panel rounded-3xl p-6">
          <h2 className="font-semibold text-white">Datos personales</h2>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">Nombre completo</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="luxia-red-glow mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {savingProfile ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar
          </button>
        </form>

        <form onSubmit={changePassword} className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="text-red-400" />
            <h2 className="font-semibold text-white">Cambiar contraseña</h2>
          </div>

          {[
            ["Contraseña actual", currentPassword, setCurrentPassword],
            ["Nueva contraseña", newPassword, setNewPassword],
            ["Confirmar contraseña", confirmPassword, setConfirmPassword],
          ].map(([label, value, setter]) => (
            <label key={String(label)} className="mt-5 block">
              <span className="mb-2 block text-sm text-zinc-500">{String(label)}</span>
              <input
                type="password"
                value={String(value)}
                onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-5 text-sm font-semibold text-red-300 disabled:opacity-50"
          >
            {savingPassword ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Cambiar contraseña
          </button>
        </form>
      </div>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 text-amber-400" />
          <div>
            <h2 className="font-semibold text-white">Cerrar todas las sesiones</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Revoca todas tus sesiones y obliga a iniciar sesión nuevamente.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void revokeSessions()}
          disabled={revoking}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/15 px-5 text-sm font-semibold text-amber-300 disabled:opacity-50"
        >
          {revoking && <LoaderCircle size={16} className="animate-spin" />}
          Cerrar todas las sesiones
        </button>
      </section>
    </div>
  );
}
