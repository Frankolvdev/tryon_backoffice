"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  AdminUser,
  AdminUserCreateRequest,
} from "@/types/admin-users";
import type {
  UserRole,
  UserStatus,
} from "@/types/auth";

const PAGE_SIZE = 50;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: "Usuario",
    admin: "Administrador",
    superadmin: "Superadministrador",
  };

  return labels[role];
}

function statusLabel(status: UserStatus): string {
  const labels: Record<UserStatus, string> = {
    active: "Activo",
    inactive: "Inactivo",
    suspended: "Suspendido",
    deleted: "Eliminado",
  };

  return labels[status];
}

function getInitials(user: AdminUser): string {
  const source = user.full_name || user.email;

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}

function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<UserRole>("user");
  const [status, setStatus] =
    useState<UserStatus>("active");
  const [isActive, setIsActive] =
    useState(true);
  const [isVerified, setIsVerified] =
    useState(false);
  const [tokenBalance, setTokenBalance] =
    useState("0");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmail("");
    setFullName("");
    setPassword("");
    setRole("user");
    setStatus("active");
    setIsActive(true);
    setIsVerified(false);
    setTokenBalance("0");
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("El correo es obligatorio.");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    const parsedBalance = Number.parseInt(
      tokenBalance,
      10,
    );

    if (
      !Number.isFinite(parsedBalance) ||
      parsedBalance < 0
    ) {
      toast.error(
        "El saldo inicial debe ser un número mayor o igual a cero.",
      );
      return;
    }

    const payload: AdminUserCreateRequest = {
      email: normalizedEmail,
      password,
      full_name: fullName.trim() || null,
      role,
      status,
      is_active: isActive,
      is_verified: isVerified,
      token_balance: parsedBalance,
    };

    setIsSubmitting(true);

    try {
      const user =
        await browserApiRequest<AdminUser>(
          "/api/admin/users",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success("Usuario creado correctamente.");
      onCreated(user);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear el usuario.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <section className="luxia-panel relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/7 bg-[#0d0d0f]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
              Administración
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Crear usuario
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-zinc-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm text-zinc-400">
                Correo electrónico
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/35 px-4 text-sm text-white outline-none focus:border-red-500/50"
                placeholder="usuario@ejemplo.com"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm text-zinc-400">
                Nombre completo
              </span>

              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/35 px-4 text-sm text-white outline-none focus:border-red-500/50"
                placeholder="Nombre del usuario"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Contraseña inicial
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/35 px-4 text-sm text-white outline-none focus:border-red-500/50"
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Tokens iniciales
              </span>

              <input
                type="number"
                min={0}
                value={tokenBalance}
                onChange={(event) =>
                  setTokenBalance(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/35 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Rol
              </span>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as UserRole,
                  )
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none focus:border-red-500/50"
              >
                <option value="user">
                  Usuario
                </option>
                <option value="admin">
                  Administrador
                </option>
                <option value="superadmin">
                  Superadministrador
                </option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Estado
              </span>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as UserStatus,
                  )
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none focus:border-red-500/50"
              >
                <option value="active">
                  Activo
                </option>
                <option value="inactive">
                  Inactivo
                </option>
                <option value="suspended">
                  Suspendido
                </option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/7 bg-black/25 p-4">
              <div>
                <p className="text-sm text-zinc-300">
                  Cuenta activa
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Permite utilizar la plataforma
                </p>
              </div>

              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
                className="size-4 accent-red-700"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/7 bg-black/25 p-4">
              <div>
                <p className="text-sm text-zinc-300">
                  Correo verificado
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Omite la verificación inicial
                </p>
              </div>

              <input
                type="checkbox"
                checked={isVerified}
                onChange={(event) =>
                  setIsVerified(
                    event.target.checked,
                  )
                }
                className="size-4 accent-red-700"
              />
            </label>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-white/6 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-white/8 px-5 text-sm text-zinc-400 hover:bg-white/[0.04]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="luxia-red-glow flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus size={17} />
              )}

              Crear usuario
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] =
    useState(false);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [createOpen, setCreateOpen] =
    useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const skip = page * PAGE_SIZE;

      const response =
        await browserApiRequest<AdminUser[]>(
          `/api/admin/users?skip=${skip}&limit=${PAGE_SIZE}&include_deleted=${includeDeleted}`,
        );

      setUsers(response);
    } catch (error) {
      setUsers([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, includeDeleted]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return [
        user.email,
        user.full_name ?? "",
        user.role,
        user.status,
        String(user.id),
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [users, search]);

  return (
    <div className="mx-auto max-w-[1700px]">
      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setPage(0);
          void loadUsers();
        }}
      />

      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-red-500 uppercase">
            Operación
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Usuarios
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Cuentas, roles, estados, tokens y
            actividad de la plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={
                isLoading ? "animate-spin" : ""
              }
            />
            Actualizar
          </button>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="luxia-red-glow flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600"
          >
            <Plus size={17} />
            Nuevo usuario
          </button>
        </div>
      </header>

      <section className="luxia-panel mt-8 rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/6 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search
              size={17}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar en la página cargada..."
              className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-500">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => {
                setIncludeDeleted(
                  event.target.checked,
                );
                setPage(0);
              }}
              className="size-4 accent-red-700"
            />

            Incluir eliminados
          </label>
        </div>

        {isLoading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <LoaderCircle className="mx-auto animate-spin text-red-500" />

              <p className="mt-4 text-sm text-zinc-500">
                Cargando usuarios...
              </p>
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="p-8">
            <AlertTriangle className="text-red-500" />

            <h2 className="mt-4 text-lg font-semibold text-white">
              No se pudo cargar el listado
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {errorMessage}
            </p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          filteredUsers.length === 0 && (
            <div className="flex min-h-96 items-center justify-center p-8 text-center">
              <div>
                <Users
                  size={35}
                  className="mx-auto text-zinc-700"
                />

                <h2 className="mt-5 text-lg font-semibold text-white">
                  No se encontraron usuarios
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Modifica la búsqueda o crea la
                  primera cuenta.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          filteredUsers.length > 0 && (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-white/6 text-left">
                      {[
                        "Usuario",
                        "Rol",
                        "Estado",
                        "Verificación",
                        "Tokens",
                        "Creado",
                        "",
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-5 py-4 text-[10px] font-semibold tracking-[0.18em] text-zinc-700 uppercase"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 transition hover:bg-white/[0.018]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-xs font-semibold text-red-300">
                              {getInitials(user)}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-72 truncate text-sm font-medium text-zinc-200">
                                {user.full_name ||
                                  "Sin nombre"}
                              </p>

                              <p className="mt-1 max-w-72 truncate text-xs text-zinc-600">
                                {user.email} · ID {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border border-white/7 bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-400">
                            {roleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-xs",
                              user.status === "active"
                                ? "border-emerald-500/15 bg-emerald-950/20 text-emerald-400"
                                : user.status ===
                                    "suspended"
                                  ? "border-red-500/15 bg-red-950/20 text-red-400"
                                  : "border-amber-500/15 bg-amber-950/20 text-amber-400",
                            )}
                          >
                            {statusLabel(user.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {user.is_verified ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-400"
                              />
                            ) : (
                              <AlertTriangle
                                size={16}
                                className="text-amber-400"
                              />
                            )}

                            {user.is_verified
                              ? "Verificado"
                              : "Pendiente"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-zinc-300">
                          {user.token_balance.toLocaleString(
                            "es-MX",
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-zinc-500">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-xs text-zinc-400 hover:border-red-500/15 hover:bg-red-950/20 hover:text-white"
                          >
                            <Eye size={15} />
                            Administrar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/6 lg:hidden">
                {filteredUsers.map((user) => (
                  <article
                    key={user.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-xs font-semibold text-red-300">
                        {getInitials(user)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {user.full_name || "Sin nombre"}
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-600">
                          {user.email}
                        </p>
                      </div>

                      <span className="text-xs text-zinc-600">
                        #{user.id}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <p className="text-zinc-700">
                          Rol
                        </p>
                        <p className="mt-1 text-zinc-300">
                          {roleLabel(user.role)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <p className="text-zinc-700">
                          Tokens
                        </p>
                        <p className="mt-1 text-zinc-300">
                          {user.token_balance.toLocaleString(
                            "es-MX",
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/users/${user.id}`}
                      className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] text-sm text-zinc-400"
                    >
                      <UserRound size={16} />
                      Administrar usuario
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}

        <footer className="flex items-center justify-between border-t border-white/6 p-5">
          <p className="text-xs text-zinc-700">
            Página {page + 1} ·{" "}
            {users.length} registros cargados
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 0),
                )
              }
              className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={
                users.length < PAGE_SIZE ||
                isLoading
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}