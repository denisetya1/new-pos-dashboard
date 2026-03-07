"use client";
import { useSidebarToggle } from "@/stores/sidebarToggle";

const Sidebar = ({ children }: { children: React.ReactElement }) => {
  const { collapsed } = useSidebarToggle();

  return (
    <div
      className={`hidden md:flex min-h-screen flex-col border-r bg-white/70 backdrop-blur transition-all duration-300 ${
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
