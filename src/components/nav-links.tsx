"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  students: Users,
  fees: CircleDollarSign,
  assessments: ClipboardList,
  results: GraduationCap,
} satisfies Record<string, LucideIcon>;

export type NavIconKey = keyof typeof NAV_ICONS;
export type NavItem = { href: string; label: string; icon: NavIconKey };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = NAV_ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-all",
              isActive
                ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px] shadow-primary/25"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
