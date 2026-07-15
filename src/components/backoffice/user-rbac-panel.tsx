"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  DatabaseZap,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AssignRoleToUserRequest,
  RbacRole,
  SuccessResponse,
  UserRbacResponse,
} from "@/types/admin-users";

interface UserRbacPanelProps {
  userId: number;
}

interface SeedRbacResponse {
  permissions_created?: number;
  roles_created?: number;
  role_permissions_created?: number;
  feature_permissions_created?: number;
  message?: string;
  [key: string]: unknown;
}

export function UserRbacPanel({
  userId,
}: UserRbacPanelProps) {
  const [rbac, setRbac] =
    useState<UserRbacResponse | null>(null);

  const [roles, setRoles] =
    useState<RbacRole[]>([]);

  const [selectedRoleId, setSelectedRoleId] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isMutating, setIsMutating] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadRbac = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [rbacResponse, rolesResponse] =
        await Promise.all([
          browserApiRequest<UserRbacResponse>(
            `/api/admin/rbac/users/${userId}`,
          ),

          browserApiRequest<RbacRole[]>(
            "/api/admin/rbac/roles",
          ),
        ]);

      setRbac(rbacResponse);
      setRoles(rolesResponse);
    } catch (error) {
      setRbac(null);
      setRoles([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los roles y permisos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadRbac();
  }, [loadRbac]);

  const assignedRoles = useMemo(() => {
    if (!rbac) {
      return [];
    }

    return roles.filter((role) =>
      rbac.role_keys.includes(role.key),
    );
  }, [roles, rbac]);

  const availableRoles = useMemo(() => {
    if (!rbac) {
      return roles.filter(
        (role) => role.is_active,
      );
    }

    return roles.filter(
      (role) =>
        role.is_active &&
        !rbac.role_keys.includes(role.key),
    );
  }, [roles, rbac]);

  const seedDefaultRbac = async () => {
    setIsMutating(true);

    try {
      const response =
        await browserApiRequest<SeedRbacResponse>(
          "/api/admin/rbac/seed-defaults",
          {
            method: "POST",
          },
        );

      toast.success(
        response.message ??
          "Roles y permisos predeterminados creados.",
      );

      await loadRbac();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible inicializar RBAC.",
      );
    } finally {
      setIsMutating(false);
    }
  };

  const assignRole = async () => {
    const roleId = Number(selectedRoleId);

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0
    ) {
      toast.error(
        "Selecciona un rol válido.",
      );

      return;
    }

    const payload: AssignRoleToUserRequest = {
      role_id: roleId,
    };

    setIsMutating(true);

    try {
      const response =
        await browserApiRequest<SuccessResponse>(
          `/api/admin/rbac/users/${userId}/roles`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success(response.message);

      setSelectedRoleId("");

      await loadRbac();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible asignar el rol.",
      );
    } finally {
      setIsMutating(false);
    }
  };

  const removeRole = async (
    role: RbacRole,
  ) => {
    const confirmed = window.confirm(
      `¿Quitar el rol "${role.name}" de este usuario?`,
    );

    if (!confirmed) {
      return;
    }

    setIsMutating(true);

    try {
      const response =
        await browserApiRequest<SuccessResponse>(
          `/api/admin/rbac/users/${userId}/roles/${role.id}`,
          {
            method: "DELETE",
          },
        );

      toast.success(response.message);

      await loadRbac();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible quitar el rol.",
      );
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-red-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Cargando roles y permisos...
          </p>
        </div>
      </div>
    );
  }

  if (!rbac || errorMessage) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-400">
          {errorMessage ??
            "No fue posible cargar RBAC."}
        </p>

        <button
          type="button"
          onClick={() => void loadRbac()}
          className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
        >
          <RefreshCcw size={16} />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="p-8 text-center">
        <DatabaseZap
          size={38}
          className="mx-auto text-red-500"
        />

        <h2 className="mt-5 text-xl font-semibold text-white">
          RBAC todavía no está inicializado
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
          El backend funciona, pero la base de datos
          todavía no contiene los roles y permisos
          predeterminados. Inicialízalos una sola vez.
        </p>

        <button
          type="button"
          disabled={isMutating}
          onClick={() =>
            void seedDefaultRbac()
          }
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isMutating ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <DatabaseZap size={16} />
          )}

          Inicializar roles predeterminados
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Asignación RBAC
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Roles del usuario
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Asigna roles adicionales al usuario.
              Sus permisos efectivos son la suma de
              todos los roles.
            </p>
          </div>

          <ShieldCheck className="text-red-400" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedRoleId}
            onChange={(event) =>
              setSelectedRoleId(
                event.target.value,
              )
            }
            disabled={
              isMutating ||
              availableRoles.length === 0
            }
            className="h-11 flex-1 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none disabled:opacity-50"
          >
            <option value="">
              Seleccionar un rol
            </option>

            {availableRoles.map((role) => (
              <option
                key={role.id}
                value={role.id}
              >
                {role.name} ({role.key})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void assignRole()}
            disabled={
              isMutating || !selectedRoleId
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isMutating ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Plus size={16} />
            )}

            Asignar rol
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {assignedRoles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/8 p-5 text-center text-sm text-zinc-600">
              Este usuario todavía no tiene roles
              RBAC adicionales.
            </p>
          ) : (
            assignedRoles.map((role) => (
              <article
                key={role.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/7 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400"
                    />

                    {role.name}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    {role.key}
                  </p>

                  {role.description && (
                    <p className="mt-2 text-xs leading-5 text-zinc-700">
                      {role.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void removeRole(role)
                  }
                  disabled={isMutating}
                  className="flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 px-3 text-xs text-red-400 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  Quitar
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-center gap-3">
          <KeyRound className="text-red-400" />

          <div>
            <h2 className="text-lg font-semibold text-white">
              Permisos efectivos
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Resultado combinado de los roles
              asignados.
            </p>
          </div>
        </div>

        {rbac.permission_keys.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-white/8 p-5 text-center text-sm text-zinc-600">
            Este usuario todavía no tiene permisos
            RBAC efectivos.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            {rbac.permission_keys.map(
              (permission) => (
                <span
                  key={permission}
                  className="rounded-full border border-red-500/15 bg-red-950/15 px-3 py-1.5 font-mono text-[11px] text-red-300"
                >
                  {permission}
                </span>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}