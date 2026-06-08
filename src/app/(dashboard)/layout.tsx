import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

import { NavLink } from "./nav-link";

const nav = [
  { href: "/dashboard", label: "Panel" },
  { href: "/inbox", label: "Bandeja" },
  { href: "/contacts", label: "Contactos" },
  { href: "/pipeline", label: "Pipeline" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-cream/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-base font-bold tracking-tight">
              5-minute<span className="text-ink-muted"> Leads</span>
            </Link>
            <nav className="flex gap-6">
              {nav.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/dashboard"
              afterSelectOrganizationUrl="/dashboard"
            />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
