"use client";
import { Button } from "@/components/ui/button";
import { useMobileSidebarToggle } from "@/stores/mobileSidebarToggle";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const MobileSidebar = ({ children }: { children: React.ReactElement }) => {
  const { mobileOpen, toggleMobileOpen } = useMobileSidebarToggle();

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleMobileOpen()}
            />

            <motion.div
              className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-xl p-4 space-y-2 md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-lg">Dashboard</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleMobileOpen()}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSidebar;
