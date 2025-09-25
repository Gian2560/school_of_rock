"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Users, CheckSquare, CalendarIcon, Megaphone, LogOut, Music } from "lucide-react"
import { signOut, useSession } from "next-auth/react";
interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Users },
    { id: "contactos", label: "Contactos", icon: Users },
    { id: "tasks", label: "Centro de tareas", icon: CheckSquare },
    { id: "calendar", label: "Calendario", icon: CalendarIcon },
    { id: "campaigns", label: "Campañas", icon: Megaphone },
  ]
const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // Cierra sesión y redirige al login
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">School Of Rock</h1>
            <p className="text-sm text-muted-foreground">CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-12 ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
