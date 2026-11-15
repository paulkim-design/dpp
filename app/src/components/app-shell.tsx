import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, FileText, LayoutDashboard, Package } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export interface Crumb {
  label: string
  to?: string
}

const NAV = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { label: "Product sets", to: "/sets/ss27-m-urban-jungle", icon: Package, match: (p: string) => p.startsWith("/sets") || p.startsWith("/products") },
  // Documents is out of scope for the prototype; shown for context only.
  { label: "Documents", to: null, icon: FileText, match: () => false },
]

export function AppShell({ crumbs, actions, children }: { crumbs: Crumb[]; actions?: React.ReactNode; children: React.ReactNode }) {
  const { pathname } = useLocation()
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar collapsible="none" className="h-svh border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">D</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">DPP Workspace</span>
              <span className="text-xs text-muted-foreground">Digital product passports</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Review</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.to ? (
                    <SidebarMenuButton asChild isActive={item.match(pathname)}>
                      <Link to={item.to} aria-current={item.match(pathname) ? "page" : undefined}>
                        <item.icon aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton aria-disabled className="cursor-default hover:bg-transparent">
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center">
            <ol className="flex items-center gap-1.5 text-sm">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1
                return (
                  <li key={c.label} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />}
                    {c.to && !last ? (
                      <Link to={c.to} className="text-muted-foreground hover:text-foreground">
                        {c.label}
                      </Link>
                    ) : (
                      <span className={last ? "text-foreground" : "text-muted-foreground"} aria-current={last ? "page" : undefined}>
                        {c.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
          {actions}
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
