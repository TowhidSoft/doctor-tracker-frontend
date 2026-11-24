import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#F4F7FD]">{children}</div>;
}
