"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { Leads } from "@/components/leads";
import { Contactos } from "@/components/contactos";
import { TaskCenter } from "@/components/task-center";
import { Calendar } from "@/components/calendar";
import { Campaigns } from "@/components/campaigns";

export default function CRMPageClient() {
  const [activeSection, setActiveSection] = useState("contactos");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "leads":
        return <Leads />;
      case "contactos":
        return <Contactos />;
      case "tasks":
        return <TaskCenter />;
      case "calendar":
        return <Calendar />;
      case "campaigns":
        return <Campaigns />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
