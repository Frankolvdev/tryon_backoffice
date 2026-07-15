"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Coins,
  CreditCard,
  KeyRound,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import { UserRbacPanel } from "@/components/backoffice/user-rbac-panel";
import { UserSessionsPanel } from "@/components/backoffice/user-sessions-panel";
import { UserSubscriptionPanel } from "@/components/backoffice/user-subscription-panel";
import { UserTokenPurchasesPanel } from "@/components/backoffice/user-token-purchases-panel";
import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  AdminUser,
  AdminUserActivityLog,
  AdminUserApiKey,
  AdminUserTokenTransaction,
} from "@/types/admin-users";

type DetailTab =
  | "summary"
  | "rbac"
  | "sessions"
  | "tokens"
  | "subscription"
  | "purchases"
  | "api-keys"
  | "activity";

interface UserDetailData {
  user: AdminUser;
  transactions: AdminUserTokenTransaction[];
  apiKeys: AdminUserApiKey[];
  activity: AdminUserActivityLog[];
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const [data, setData] = useState<UserDetailData | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!Number.isInteger(userId) || userId <= 0) {
      setErrorMessage("El identificador del usuario no es válido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [user, transactions, apiKeys, activity] = await Promise.all([
        browserApiRequest<AdminUser>(`/api/admin/users/${userId}`),
        browserApiRequest<AdminUserTokenTransaction[]>(
          `/api/admin/users/${userId}/token-transactions?skip=0&limit=100`,
        ),
        browserApiRequest<AdminUserApiKey[]>(
          `/api/admin/users/${userId}/api-keys?skip=0&limit=200`,
        ),
        browserApiRequest<AdminUserActivityLog[]>(
          `/api/admin/users/${userId}/activity-logs?skip=0&limit=200`,
        ),
      ]);

      setData({ user, transactions, apiKeys, activity });
    } catch (error) {
      setData(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el usuario.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  if (!data || errorMessage) {
    return (
      <section className="luxia-panel mx-auto max-w-3xl rounded-3xl p-8">
        <AlertTriangle className="text-red-500" />
        <h1 className="mt-5 text-2xl font-semibold text-white">
          No se pudo cargar el usuario
        </h1>
        <p className="mt-3 text-sm text-zinc-500">{errorMessage}</p>
        <Link
          href="/dashboard/users"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Regresar
        </Link>
      </section>
    );
  }

  const { user } = data;

  const tabs: Array<{
    key: DetailTab;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    count?: number;
  }> = [
    { key: "summary", label: "Resumen", icon: UserRound },
    { key: "rbac", label: "Roles y permisos", icon: ShieldCheck },
    { key: "sessions", label: "Sesiones", icon: MonitorSmartphone },
    {
      key: "tokens",
      label: "Movimientos de tokens",
      icon: Coins,
      count: data.transactions.length,
    },
    { key: "subscription", label: "Suscripción", icon: CreditCard },
    { key: "purchases", label: "Compras de tokens", icon: ShoppingCart },
    {
      key: "api-keys",
      label: "API Keys",
      icon: KeyRound,
      count: data.apiKeys.length,
    },
    {
      key: "activity",
      label: "Actividad",
      icon: Activity,
      count: data.activity.length,
    },
  ];

  return (
    <div className="mx-auto max-w-[1700px]">
      <header>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a usuarios
        </Link>

        <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
              <UserRound size={25} />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                Usuario #{user.id}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">
                {user.full_name || "Sin nombre"}
              </h1>
              <p className="mt-2 break-all text-sm text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUser()}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
          >
            <RefreshCcw size={16} />
            Actualizar
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="luxia-panel rounded-2xl p-5">
          <ShieldCheck className="text-red-400" />
          <p className="mt-5 text-xs text-zinc-600">Rol</p>
          <p className="mt-2 text-xl font-semibold text-white">{user.role}</p>
        </article>
        <article className="luxia-panel rounded-2xl p-5">
          <Activity className="text-red-400" />
          <p className="mt-5 text-xs text-zinc-600">Estado</p>
          <p className="mt-2 text-xl font-semibold text-white">{user.status}</p>
        </article>
        <article className="luxia-panel rounded-2xl p-5">
          <Coins className="text-red-400" />
          <p className="mt-5 text-xs text-zinc-600">Balance</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {user.token_balance.toLocaleString("es-MX")}
          </p>
        </article>
        <article className="luxia-panel rounded-2xl p-5">
          <UserRound className="text-red-400" />
          <p className="mt-5 text-xs text-zinc-600">Verificado</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {user.is_verified ? "Sí" : "No"}
          </p>
        </article>
      </section>

      <section className="luxia-panel mt-6 overflow-hidden rounded-3xl">
        <div className="overflow-x-auto border-b border-white/6">
          <div className="flex min-w-max gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition",
                    activeTab === tab.key
                      ? "bg-red-950/35 text-red-300"
                      : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-300",
                  )}
                >
                  <Icon size={15} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px]">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "summary" && (
          <div className="grid gap-5 p-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <h2 className="font-semibold text-white">Cuenta</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                  <dt className="text-zinc-600">Correo</dt>
                  <dd className="break-all text-right text-zinc-300">
                    {user.email}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                  <dt className="text-zinc-600">Nombre</dt>
                  <dd className="text-right text-zinc-300">
                    {user.full_name ?? "Sin nombre"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                  <dt className="text-zinc-600">Proveedor</dt>
                  <dd className="text-zinc-300">{user.auth_provider}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-600">Activo</dt>
                  <dd className="text-zinc-300">
                    {user.is_active ? "Sí" : "No"}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <h2 className="font-semibold text-white">Fechas</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                  <dt className="text-zinc-600">Creado</dt>
                  <dd className="text-right text-zinc-300">
                    {formatDate(user.created_at)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                  <dt className="text-zinc-600">Actualizado</dt>
                  <dd className="text-right text-zinc-300">
                    {formatDate(user.updated_at)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-600">Eliminado</dt>
                  <dd className="text-right text-zinc-300">
                    {formatDate(user.deleted_at)}
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        )}

        {activeTab === "rbac" && <UserRbacPanel userId={userId} />}
        {activeTab === "sessions" && <UserSessionsPanel userId={userId} />}
        {activeTab === "subscription" && (
          <UserSubscriptionPanel userId={userId} />
        )}
        {activeTab === "purchases" && (
          <UserTokenPurchasesPanel userId={userId} />
        )}

        {activeTab === "tokens" && (
          <div className="divide-y divide-white/6">
            {data.transactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-zinc-600">
                No existen movimientos de tokens.
              </p>
            ) : (
              data.transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      {transaction.description ||
                        transaction.source ||
                        transaction.transaction_type}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {formatDate(transaction.created_at)} · Balance posterior:{" "}
                      {transaction.balance_after}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      transaction.amount >= 0
                        ? "text-emerald-400"
                        : "text-red-400",
                    )}
                  >
                    {transaction.amount >= 0 ? "+" : ""}
                    {transaction.amount}
                  </p>
                </article>
              ))
            )}
          </div>
        )}

        {activeTab === "api-keys" && (
          <div className="divide-y divide-white/6">
            {data.apiKeys.length === 0 ? (
              <p className="p-8 text-center text-sm text-zinc-600">
                El usuario no tiene API keys.
              </p>
            ) : (
              data.apiKeys.map((apiKey) => (
                <article key={apiKey.id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        {apiKey.name}
                      </p>
                      <p className="mt-2 font-mono text-xs text-zinc-600">
                        {apiKey.key_prefix}••••••••
                      </p>
                    </div>
                    <span className="rounded-full border border-white/7 px-3 py-1 text-xs text-zinc-500">
                      {apiKey.status}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="divide-y divide-white/6">
            {data.activity.length === 0 ? (
              <p className="p-8 text-center text-sm text-zinc-600">
                No existe actividad registrada.
              </p>
            ) : (
              data.activity.map((entry) => (
                <article key={entry.id} className="p-5">
                  <p className="text-sm font-medium text-zinc-300">
                    {entry.action}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {entry.description || "Sin descripción"}
                  </p>
                  <p className="mt-3 text-xs text-zinc-700">
                    {formatDate(entry.created_at)} · IP:{" "}
                    {entry.ip_address || "No disponible"}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
