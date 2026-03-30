"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MsIcon } from "@/components/ms-icon";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/entities", label: "Entities", icon: "hub" },
  { href: "/supply-chain", label: "Supply Chain", icon: "account_tree" },
  { href: "/geoint", label: "GEOINT", icon: "satellite_alt" },
  { href: "/compliance", label: "Compliance", icon: "verified_user" },
  { href: "/sources", label: "Intel Sources", icon: "cable" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[var(--color-surface-container-low)] flex flex-col shrink-0 z-50">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-container)] flex items-center justify-center">
              <MsIcon name="hub" className="text-[18px] text-[var(--color-secondary-foreground)]" filled />
            </div>
            <div>
              <h1 className="text-[13px] font-bold tracking-[-0.01em] text-foreground leading-none">
                MineralScope
              </h1>
              <p className="text-[10px] text-[var(--color-secondary)] font-semibold tracking-[0.08em] uppercase mt-[3px] leading-none">
                Energy Extension
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 mb-3">
          <div className="relative flex items-center group">
            <MsIcon name="search" className="absolute left-3 text-[18px] text-[var(--color-outline)] group-focus-within:text-[var(--color-primary)] transition-colors" />
            <input
              type="text"
              placeholder="Search entities..."
              className="w-full bg-[var(--color-surface-container)] border-none text-[13px] py-[9px] pl-10 pr-3 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:bg-[var(--color-surface-container-high)] placeholder:text-[var(--color-outline)] text-foreground transition-all"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-[2px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-[10px] text-[13px] rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-[var(--color-secondary)]/[0.08] text-[var(--color-secondary)] font-semibold"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-container-high)] hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--color-secondary)] rounded-r-full" />
                )}
                <MsIcon
                  name={item.icon}
                  className={cn(
                    "text-[20px]",
                    isActive ? "text-[var(--color-secondary)]" : "text-[var(--color-outline)]"
                  )}
                  filled={isActive}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[var(--color-border)] space-y-[2px]">
          <div className="flex items-center gap-3 px-3 py-[10px] text-[13px] text-[var(--color-muted-foreground)] rounded-xl hover:bg-[var(--color-surface-container-high)] hover:text-foreground transition-all cursor-pointer">
            <MsIcon name="settings" className="text-[20px] text-[var(--color-outline)]" />
            <span>Settings</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-secondary)] opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-secondary)]" />
            </span>
            <span className="text-[10px] text-[var(--color-muted-foreground)] tracking-[0.05em] uppercase">
              OSINT feeds active
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-[52px] bg-[var(--color-surface)]/80 backdrop-blur-xl flex items-center justify-between px-6 border-b border-[var(--color-border)] shrink-0 z-40">
          <div className="flex items-center gap-5">
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[var(--color-muted-foreground)] font-[var(--font-headline)]">
              MINERAL_SENTINEL
            </span>
            <div className="h-4 w-px bg-[var(--color-border)]" />
            <span className="text-[11px] text-[var(--color-outline)] tracking-[0.06em] uppercase">
              Critical Minerals v2.4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-container)] transition-colors rounded-xl relative group">
              <MsIcon name="notifications" className="text-[20px]" />
              <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[var(--color-tertiary)] rounded-full ring-2 ring-[var(--color-surface)]" />
            </button>
            <button className="p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-container)] transition-colors rounded-xl">
              <MsIcon name="tune" className="text-[20px]" />
            </button>
            <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] flex items-center justify-center ring-2 ring-[var(--color-surface)] ring-offset-2 ring-offset-[var(--color-surface)]">
              <span className="text-[11px] font-bold text-white">KP</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-14">
          {children}
        </main>

        {/* Status bar */}
        <footer className="h-7 bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-border)] flex items-center justify-between px-5 shrink-0 z-40">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-[6px] text-[10px] tracking-[0.04em] uppercase text-[var(--color-secondary)]/80">
              <span className="relative flex h-[5px] w-[5px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-secondary)] opacity-40" />
                <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-[var(--color-secondary)]" />
              </span>
              Operational
            </span>
            <span className="text-[10px] text-[var(--color-outline)] tracking-[0.04em] uppercase">
              Streams: 1,402
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-[var(--color-outline)] tracking-[0.04em] uppercase">Sync: 2m ago</span>
            <span className="text-[10px] text-[var(--color-outline)] tracking-[0.04em] uppercase">API: 12ms</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
