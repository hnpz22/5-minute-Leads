import Link from "next/link";
import Image from "next/image";
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
            <Link href="/dashboard">
              <Image
                src="/brand/logo.png"
                alt="5-minute Leads"
                width={220}
                height={120}
                className="h-8 w-auto rounded"
                priority
              />
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
