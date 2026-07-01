"use client";
import { useSidebarToggle } from "@/stores/sidebarToggle";

const Sidebar = ({ children }: { children: React.ReactElement }) => {
  const { collapsed } = useSidebarToggle();

  return (
    <div
      className={`relative z-[90] hidden min-h-screen flex-col overflow-visible border-r bg-white/70 backdrop-blur transition-all duration-300 md:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6 text-xl font-bold">
        {collapsed ? "D" : "Dashboard"}
      </div>

      {children}
    </div>
  );
};

export default Sidebar;
