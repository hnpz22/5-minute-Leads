"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative py-1 text-sm transition-colors ${
        active ? "font-semibold text-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-lime-deep" />
      )}
    </Link>
  );
}
