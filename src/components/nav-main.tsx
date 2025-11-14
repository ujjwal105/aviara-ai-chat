import { type LucideIcon } from "lucide-react";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem className="py-1.5">
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="hover:bg-[#01DD76]"
              >
                <a
                  href={item.url}
                  className={`relative flex items-center h-10 bg-[#01DD85] cursor-pointer ${
                    state === "collapsed" ? "justify-center" : "pl-4"
                  }`}
                >
                  {/* Icon Menu Item */}
                  <div className="w-6 h-6">
                    <item.icon className="w-6 h-6" />
                  </div>
                  {/* Menu Label */}
                  {state !== "collapsed" && (
                    <div className="flex-1 font-medium text-left text-sm ml-4">
                      {item.title}
                    </div>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
