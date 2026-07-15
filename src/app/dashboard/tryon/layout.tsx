import type { ReactNode } from "react";

interface TryOnLayoutProps {
  children: ReactNode;
}

export default function TryOnLayout({
  children,
}: Readonly<TryOnLayoutProps>) {
  return (
    <div className="mx-auto max-w-[1700px]">
      {children}
    </div>
  );
}
