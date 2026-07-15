import type {
  ReactNode,
} from "react";

import { SystemSettingsTabs } from "@/components/backoffice/system/system-settings-tabs";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({
  children,
}: Readonly<SettingsLayoutProps>) {
  return (
    <div>
      <SystemSettingsTabs />
      {children}
    </div>
  );
}
