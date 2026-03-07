import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  Home,
  Users,
  Settings,
  Menu,
  Search,
  Bell,
  PanelLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Jan", total: 400 },
  { name: "Feb", total: 300 },
  { name: "Mar", total: 500 },
  { name: "Apr", total: 200 },
  { name: "May", total: 600 },
  { name: "Jun", total: 700 },
];

function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`hidden md:flex h-screen flex-col border-r bg-white/70 backdrop-blur transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6 text-xl font-bold">
        {collapsed ? "D" : "Dashboard"}
      </div>
      <nav className="flex-1 space-y-2 px-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Home className="h-4 w-4" /> {!collapsed && "Home"}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <BarChart3 className="h-4 w-4" /> {!collapsed && "Analytics"}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" /> {!collapsed && "Users"}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" /> {!collapsed && "Settings"}
        </Button>
      </nav>
    </div>
  );
}

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="p-4 text-lg font-semibold">Dashboard</div>
        <div className="space-y-2 px-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BarChart3 className="h-4 w-4" /> Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" /> Users
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white/80 backdrop-blur px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar />

            {/* Desktop Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-9 w-64" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Revenue", "Users", "Orders", "Growth"].map((title, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$12,345</div>
                    <p className="text-xs text-gray-500 mt-1">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
