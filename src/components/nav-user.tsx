import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "./theme-provider";

export function NavUser() {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
              state === "collapsed" ? "justify-center" : ""
            }`}
          >
            <div className="w-6 h-6">
              <Moon className="w-6 h-6" />
            </div>
            {state !== "collapsed" && <span>Theme</span>}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          size="lg"
          className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
            state === "collapsed" ? "justify-center" : ""
          }`}
        >
          {theme === "dark" ? (
            <>
              <div className="w-6 h-6">
                <Sun className="w-6 h-6" />
              </div>
              {state !== "collapsed" && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <div className="w-6 h-6">
                <Moon className="w-6 h-6" />
              </div>
              {state !== "collapsed" && <span>Dark Mode</span>}
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
