"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useMobileSidebarToggle } from "@/stores/mobileSidebarToggle";
import { useSidebarToggle } from "@/stores/sidebarToggle";

/* =====================================================
   REUSABLE SIDEBAR COMPONENT
   - Smooth height animation (no max-height hack)
   - Route config injection
   - Auto-open if child route active
   - SAFE href handling (no non-null assertion)
===================================================== */

export type NavChildItem = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  icon?: React.ElementType;
  href?: string;
  children?: NavChildItem[];
};

interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
}

/* ==============================
   Smooth height animation helper
================================ */

const AnimatedSubmenu: React.FC<{
  open: boolean;
  children: React.ReactNode;
}> = ({ open, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(0);

  useEffect(() => {
    if (!ref.current) return;

    if (open) {
      const scrollHeight = ref.current.scrollHeight;
      setHeight(scrollHeight);
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    } else {
      const currentHeight = ref.current.scrollHeight;
      setHeight(currentHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <div
      style={{ height }}
      className="overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div ref={ref}>{children}</div>
    </div>
  );
};

export const Navigation: React.FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname();
  const { mobileOpen } = useMobileSidebarToggle();
  const { collapsed } = useSidebarToggle();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside>
      <nav className="p-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const hasChildren =
            Array.isArray(item.children) && item.children.length > 0;
          const hasHref = typeof item.href === "string" && item.href.length > 0;

          if (!hasChildren && hasHref && item.href) {
            const active = pathname === item.href;

            return (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 transition-colors hover:bg-brand-50 hover:text-brand-600 hover:cursor-pointer ${
                    active ? "bg-brand-100 text-brand-600" : ""
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          }

          if (hasChildren && item.children) {
            const isChildActive = item.children.some((c) =>
              pathname.startsWith(c.href),
            );

            const isOpen = openMenu === item.label || isChildActive;

            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  onClick={() => !collapsed && toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between transition-colors hover:bg-brand-50 hover:text-brand-600 hover:cursor-pointer ${
                    isChildActive ? "bg-brand-100 text-brand-600" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} />}
                    {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                  </div>

                  {(!collapsed || mobileOpen) && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Button>

                {(!collapsed || mobileOpen) && (
                  <AnimatedSubmenu open={isOpen}>
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const active = pathname === child.href;
                        return (
                          <Link key={child.label} href={child.href}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start font-medium text-sm transition-colors hover:bg-brand-50 hover:text-brand-600 hover:cursor-pointer ${
                                active ? "bg-brand-100 text-brand-600" : ""
                              }`}
                            >
                              {child.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </AnimatedSubmenu>
                )}
              </div>
            );
          }

          console.warn(
            `Sidebar item "${item.label}" is missing both href and children.`,
          );
          return null;
        })}
      </nav>
    </aside>
  );
};
