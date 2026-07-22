import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { appConfig } from "@/config/app";

import "./globals.css";
import "@xyflow/react/dist/style.css";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} Backoffice`,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  applicationName: `${appConfig.name} Backoffice`,
  robots: {
    index: false,
    follow: false,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}