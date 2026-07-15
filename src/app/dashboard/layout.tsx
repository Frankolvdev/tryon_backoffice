import { redirect } from "next/navigation";

import { BackofficeShell } from "@/components/backoffice/backoffice-shell";
import { getAuthenticatedAdmin } from "@/lib/server/admin-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  try {
    await getAuthenticatedAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <BackofficeShell>
      {children}
    </BackofficeShell>
  );
}