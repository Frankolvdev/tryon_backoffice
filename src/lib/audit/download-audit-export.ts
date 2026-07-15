import type {
  AuditExportRequest,
} from "@/types/admin-audit-restore-export";

export type AuditExportFormat =
  | "json"
  | "csv";

function extractFilename(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match =
    contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/i,
    );

  if (utf8Match?.[1]) {
    return decodeURIComponent(
      utf8Match[1],
    );
  }

  const basicMatch =
    contentDisposition.match(
      /filename="?([^";]+)"?/i,
    );

  return basicMatch?.[1] ??
    fallback;
}

async function errorMessage(
  response: Response,
): Promise<string> {
  const contentType =
    response.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      const payload =
        (await response.json()) as {
          detail?: string;
          message?: string;
          error?: {
            message?: string;
          };
        };

      return (
        payload.detail ??
        payload.error?.message ??
        payload.message ??
        "No fue posible exportar la auditoría."
      );
    } catch {
      return "No fue posible exportar la auditoría.";
    }
  }

  return (
    (await response.text()) ||
    "No fue posible exportar la auditoría."
  );
}

export async function downloadAuditExport(
  format: AuditExportFormat,
  payload: AuditExportRequest,
): Promise<number | null> {
  const response = await fetch(
    `/api/admin/audit-entries/export/${format}`,
    {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept:
          format === "json"
            ? "application/json"
            : "text/csv",
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await errorMessage(response),
    );
  }

  const blob = await response.blob();

  const fallback =
    `audit-export-${new Date()
      .toISOString()
      .replaceAll(":", "-")}.${format}`;

  const filename = extractFilename(
    response.headers.get(
      "content-disposition",
    ),
    fallback,
  );

  const objectUrl =
    URL.createObjectURL(blob);

  try {
    const anchor =
      document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const exportedRecords =
    response.headers.get(
      "x-exported-records",
    );

  if (!exportedRecords) {
    return null;
  }

  const parsed =
    Number(exportedRecords);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}
