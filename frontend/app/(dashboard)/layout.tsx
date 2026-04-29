"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileModal } from "./components/ProfileModal";
import { ChatSidebar } from "./components/ChatSidebar";
import { MessageSquare, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceProvider, usePresence } from "@/lib/presence/PresenceProvider";
import { RoadmapLock } from "@/components/ui/RoadmapLock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PresenceProvider>
      <DashboardContent>{children}</DashboardContent>
    </PresenceProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { status } = usePresence();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-relay-bg text-relay-text-primary">
      {/* Sidebar */}
      <aside className="w-[68px] flex flex-col items-center py-4 bg-relay-surf border-r border-relay-border z-10">
        {/* Top Icons */}
        <div className="flex flex-col gap-4 flex-1">
          <SidebarIcon icon={<MessageSquare className="w-5 h-5" />} active />
          
          <RoadmapLock phase={3} label="Global Users">
            <SidebarIcon icon={<Users className="w-5 h-5" />} />
          </RoadmapLock>

          <RoadmapLock phase={5} label="System Settings">
            <SidebarIcon icon={<Settings className="w-5 h-5" />} />
          </RoadmapLock>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="group relative transition-transform active:scale-90"
          >
            <Avatar
              src={session?.user?.image}
              name={session?.user?.name}
              size="md"
              showDot
              status={status}
            />
            <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Profile Settings
            </div>
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 text-relay-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Chat List Sidebar */}
      <ChatSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-relay-card shadow-sm">
        {children}
      </main>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}

function SidebarIcon({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={cn(
        "p-3 rounded-2xl transition-all duration-200 group relative",
        active 
          ? "bg-relay-accent text-white shadow-lg shadow-relay-accent/20" 
          : "text-relay-text-secondary hover:bg-relay-subtle hover:text-relay-text-primary"
      )}
    >
      {icon}
      {!active && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Menu Item
        </div>
      )}
    </button>
  );
}
