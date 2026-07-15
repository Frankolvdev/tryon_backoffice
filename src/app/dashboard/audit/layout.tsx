import type {
  ReactNode,
} from "react";

import { AuditTabs } from "@/components/backoffice/audit/audit-tabs";

interface AuditLayoutProps {
  children: ReactNode;
}

export default function AuditLayout({
  children,
}: Readonly<AuditLayoutProps>) {
  return (
    <div>
      <AuditTabs />
      {children}
    </div>
  );
}
