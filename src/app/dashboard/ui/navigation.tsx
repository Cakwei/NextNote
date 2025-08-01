import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CSSProperties, PointerEvent } from "react";
import { sideBarLinks } from "@/constants/constants";
import { ItemIndicator } from "@radix-ui/react-select";

// Fake data
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function DashboardSidebar({
  hoverFunc,
}: {
  hoverFunc?: (e: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <Sidebar onPointerOver={hoverFunc}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NextNote</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideBarLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className={item.className} asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
