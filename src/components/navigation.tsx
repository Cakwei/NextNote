"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { ChevronDownIcon, Paperclip } from "lucide-react";
import { fakeNotesArray, sideBarLinks } from "@/constants/constants";

export function DashboardSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-[var(--sidebar-border)] border bg-black"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarTrigger className="w-full" />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {/* Main "NextNote" section - remains non-collapsible */}
          <SidebarGroupLabel>NextNote</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideBarLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className={item.className} asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator
          className="m-0 p-0
         w-full"
        />
        {/* --- Collapsible "Saved Notes" section --- */}
        <Collapsible defaultOpen={true}>
          <SidebarGroup>
            <SidebarGroupContent>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="group w-full justify-between pr-4">
                  {state === "expanded" ? (
                    <SidebarGroupLabel className="pl-0">
                      Saved Notes
                    </SidebarGroupLabel>
                  ) : (
                    <Paperclip className="w-full justify-center flex" />
                  )}
                  <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarGroupContent>
          </SidebarGroup>

          <CollapsibleContent>
            <SidebarGroup className="m-0 p-0 pb-2 px-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  {fakeNotesArray.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={`dashboard?note=${item.id}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </CollapsibleContent>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
