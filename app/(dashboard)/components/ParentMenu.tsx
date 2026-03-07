import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ParentMenu = ({
  icon,
  label,
  open,
  onClick,
  collapsed,
  children,
}: any) => {
  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => !collapsed && onClick()}
        className="w-full flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-3">
          {icon}
          {!collapsed && <span>{label}</span>}
        </div>
        {!collapsed && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Button>

      <AnimatePresence initial={false}>
        {!collapsed && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-1 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentMenu;
