"use client";

import { KeyRound, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AdminUser,
  AdminUserPasswordResetRequest,
  AdminUserUpdateRequest,
  SuccessResponse,
} from "@/types/admin-users";

interface Props {
  user: AdminUser;
  onUpdated: (user: AdminUser) => void;
}

export function UserAccountManagementPanel({
  user,
  onUpdated,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingPermanently, setDeletingPermanently] = useState(false);

  useEffect(() => {
    setEmail(user.email);
    setFullName(user.full_name ?? "");
  }, [user]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("El correo es obligatorio.");
      return;
    }

    const payload: AdminUserUpdateRequest = {
      email: email.trim().toLowerCase(),
      full_name: fullName.trim() || null,
    };

    setSavingProfile(true);

    try {
      const updated = await browserApiRequest<AdminUser>(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );

      onUpdated(updated);
      toast.success("Datos del usuario actualizados.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el usuario.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    const confirmed = window.confirm(
      `Se restablecerá la contraseña de ${user.email}. ¿Deseas continuar?`,
    );

    if (!confirmed) return;

    const payload: AdminUserPasswordResetRequest = {
      new_password: newPassword,
    };

    setSavingPassword(true);

    try {
      const response = await browserApiRequest<SuccessResponse>(
        `/api/admin/users/${user.id}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      setNewPassword("");
      setConfirmPassword("");
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible restablecer la contraseña.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const permanentlyDeleteUser = async () => {
    if (deleteConfirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
      toast.error("Escribe exactamente el correo del usuario para confirmar.");
      return;
    }

    const confirmed = window.confirm(
      `Esta acción eliminará permanentemente a ${user.email} y todos sus datos asociados. No se puede deshacer.`,
    );

    if (!confirmed) return;

    setDeletingPermanently(true);

    try {
      const response = await browserApiRequest<SuccessResponse>(
        `/api/admin/users/${user.id}/permanent`,
        { method: "DELETE" },
      );

      toast.success(response.message);
      router.replace("/dashboard/users");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar permanentemente el usuario.",
      );
    } finally {
      setDeletingPermanently(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <form
        onSubmit={saveProfile}
        className="luxia-panel rounded-3xl p-6"
      >
        <h2 className="font-semibold text-white">
          Datos de acceso
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Cambia el correo y nombre del usuario.
        </p>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Correo electrónico
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Nombre completo
          </span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <button
          type="submit"
          disabled={savingProfile}
          className="luxia-red-glow mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {savingProfile ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar cambios
        </button>
      </form>

      <form
        onSubmit={resetPassword}
        className="luxia-panel rounded-3xl p-6"
      >
        <div className="flex items-center gap-3">
          <KeyRound className="text-red-400" />
          <h2 className="font-semibold text-white">
            Restablecer contraseña
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Asigna directamente una contraseña nueva al usuario.
        </p>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Nueva contraseña
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Confirmar contraseña
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <button
          type="submit"
          disabled={savingPassword}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-5 text-sm font-semibold text-red-300 disabled:opacity-50"
        >
          {savingPassword ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          Restablecer contraseña
        </button>
      </form>

      <section className="rounded-3xl border border-red-500/20 bg-red-950/10 p-6 xl:col-span-2">
        <div className="flex items-center gap-3">
          <Trash2 className="text-red-400" />
          <div>
            <h2 className="font-semibold text-white">Eliminación permanente</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Borra definitivamente la cuenta y sus datos asociados. El correo quedará libre para registrarse de nuevo. Solo un superadministrador puede ejecutar esta acción.
            </p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Escribe {user.email} para confirmar
          </span>
          <input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={user.email}
            className="h-11 w-full rounded-xl border border-red-500/20 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <button
          type="button"
          onClick={() => void permanentlyDeleteUser()}
          disabled={deletingPermanently || deleteConfirmation.trim().toLowerCase() !== user.email.toLowerCase()}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deletingPermanently ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          Eliminar permanentemente
        </button>
      </section>
    </div>
  );
}
