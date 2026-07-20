"use client";

import Link from "next/link";
import {
  useParams,
} from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Gauge,
  LoaderCircle,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { IntegrationEditor } from "@/components/backoffice/integrations/integration-editor";
import { IntegrationStatusBadge } from "@/components/backoffice/integrations/integration-status-badge";
import { GoogleOAuthForm } from "@/components/backoffice/integrations/oauth/google-form";
import { OAuthProviderForm } from "@/components/backoffice/integrations/oauth/oauth-provider-form";
import { SmtpIntegrationEditor } from "@/components/backoffice/integrations/smtp-integration-editor";
import { StripeIntegrationEditor } from "@/components/backoffice/integrations/stripe-integration-editor";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  getIntegrationCatalogItem,
} from "@/lib/integrations/catalog";
import { isRemainingOAuthProvider } from "@/lib/integrations/oauth";

import type {
  IntegrationConfigResponse,
  IntegrationHealthResponse,
  IntegrationProvider,
} from "@/types/admin-integrations";

const editableProviders:
  IntegrationProvider[] = [
    "comfyui",
    "runpod",
    "s3",
    "stripe",
    "smtp",
    "google_oauth",
    "github_oauth",
    "facebook_oauth",
    "apple_oauth",
  ];

export default function IntegrationDetailPage() {
  const params = useParams<{
    provider: string;
  }>();

  const provider =
    params.provider as IntegrationProvider;

  const [integration, setIntegration] =
    useState<IntegrationConfigResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isChecking, setIsChecking] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadIntegration =
    useCallback(async () => {
      if (
        !editableProviders.includes(
          provider,
        )
      ) {
        setIntegration(null);
        setErrorMessage(
          "Este proveedor se configurará en un paquete posterior.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<IntegrationConfigResponse>(
            `/api/admin/integrations/${provider}`,
          );

        setIntegration(response);
      } catch (error) {
        setIntegration(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la integración.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [provider]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration]);

  const checkHealth = async () => {
    if (!integration) return;

    setIsChecking(true);

    try {
      const response =
        await browserApiRequest<IntegrationHealthResponse>(
          `/api/admin/integrations/${provider}/health`,
          {
            method: "POST",
          },
        );

      if (
        response.status === "healthy"
      ) {
        toast.success(
          response.message,
        );
      } else {
        toast.warning(
          response.message,
        );
      }

      await loadIntegration();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible comprobar la integración.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  const catalog =
    getIntegrationCatalogItem(
      provider,
    );

  if (isLoading) {
    return (
      <section className="luxia-panel flex min-h-80 items-center justify-center rounded-3xl">
        <LoaderCircle className="animate-spin text-red-500" />
      </section>
    );
  }

  if (
    !integration ||
    errorMessage
  ) {
    return (
      <div>
        <Link
          href="/dashboard/integrations"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
            <TriangleAlert className="mt-0.5 shrink-0 text-red-400" />

            <p className="text-sm leading-6 text-red-300">
              {errorMessage}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/integrations"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a integraciones
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <IntegrationStatusBadge
            status={
              integration.status
            }
            health={
              integration.last_health_status
            }
          />

          <button
            type="button"
            onClick={() =>
              void loadIntegration()
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400"
          >
            <RefreshCcw size={16} />
            Actualizar
          </button>

          <button
            type="button"
            disabled={
              isChecking ||
              !integration.is_enabled
            }
            onClick={() =>
              void checkHealth()
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-40"
          >
            {isChecking ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Gauge size={16} />
            )}

            Comprobar salud
          </button>
        </div>
      </div>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
          Sistema · Integraciones
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          {catalog.label}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
          {integration.last_health_message ??
            catalog.description}
        </p>
      </section>

      <div className="mt-5">
        {provider === "stripe" ? (
          <StripeIntegrationEditor
            integration={integration}
            onSaved={setIntegration}
          />
        ) : provider === "smtp" ? (
          <SmtpIntegrationEditor
            integration={integration}
            onSaved={setIntegration}
          />
        ) : provider === "google_oauth" ? (
          <GoogleOAuthForm
            integration={integration}
            onSaved={setIntegration}
          />
        ) : isRemainingOAuthProvider(provider) ? (
          <OAuthProviderForm
            provider={provider}
            integration={integration}
            onSaved={setIntegration}
          />
        ) : (
          <IntegrationEditor
            integration={integration}
            onSaved={setIntegration}
          />
        )}
      </div>
    </div>
  );
}
