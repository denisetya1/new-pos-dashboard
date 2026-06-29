"use client";

import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useSidebarToggle } from "@/stores/sidebarToggle";
import { PanelLeft, Menu } from "lucide-react";
import MobileSidebar from "./components/MobileSidebar";
import { useMobileSidebarToggle } from "@/stores/mobileSidebarToggle";
import { Navigation } from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Bounce, ToastContainer } from "react-toastify";
import OutletInfo from "./components/OutletInfo";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { menuConfig } from "@/constants/menus";

const queryClient = new QueryClient();

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toggleCollapse } = useSidebarToggle();
  const { toggleMobileOpen } = useMobileSidebarToggle();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="flex min-h-screen max-w-screen bg-gray-50 text-gray-900">
            {!isLoading && (
              <>
                <Sidebar>
                  <Navigation items={menuConfig} />
                </Sidebar>
                <MobileSidebar>
                  <Navigation items={menuConfig} />
                </MobileSidebar>
              </>
            )}

            <div className="flex-1 flex flex-col w-full">
              <>
                <header className="flex items-center justify-between border-b bg-white/80 backdrop-blur px-4 py-3 md:px-6">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => toggleMobileOpen()}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                    {/* Desktop Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex"
                      onClick={() => toggleCollapse()}
                    >
                      <PanelLeft className="h-5 w-5" />
                    </Button>

                    <OutletInfo onFinishLoading={() => setIsLoading(false)} />
                  </div>

                  <div className="hidden md:flex items-center gap-4 ">
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
              </>
              {/* Main Content */}
              <main className="grow p-4 md:p-6 space-y-6">
                {isLoading ? (
                  <div className="fixed top-0 left-0 bottom-0 right-0 w-full h-full flex items-center justify-center">
                    <div className="block w-75 h-75 text-center">
                      <div className="m-auto flex justify-center">
                        <Spinner className="size-5" />
                      </div>
                      <div className="m-auto">Loading...</div>
                    </div>
                  </div>
                ) : (
                  children
                )}
              </main>
            </div>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Layout;
