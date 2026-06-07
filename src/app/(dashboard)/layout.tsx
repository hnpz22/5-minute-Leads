import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/dashboard", label: "Panel" },
  { href: "/contacts", label: "Contactos" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/inbox", label: "Bandeja" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            CRM
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-black">
                {item.label}
              </Link>
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
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
