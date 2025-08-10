"use client";
import React, { MouseEventHandler, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutDashboard,
  History,
} from "lucide-react";
import { NavLink } from "@/types/types";

// The Sidebar component is the main, reusable component.
// It uses props to be flexible.
const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  links,
}: {
  isCollapsed: boolean;
  onToggleCollapse: MouseEventHandler<HTMLButtonElement>;
  links: NavLink;
}) => {
  return (
    <TooltipProvider>
      <aside
        // The sidebar container. It's a flexbox column with dynamic width based on the collapsed state.
        // The transition classes create a smooth animation effect.
        className={`
                    flex flex-col h-screen p-4 border-r bg-background transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-16" : "w-64"}
                `}
      >
        {/* Header section with a toggle button */}
        <div className="flex items-center justify-between h-16 mb-4">
          {!isCollapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
          <Button
            variant="ghost"
            size="icon"
            className={`
                            rounded-full transition-transform duration-300 ease-in-out
                            ${isCollapsed ? "rotate-180" : "rotate-0"}
                        `}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation links section */}
        <nav className="flex-1 flex flex-col gap-2">
          {links.map((link) => (
            <div key={link.href}>
              {/* A tooltip is used to show the label when the sidebar is collapsed */}
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full justify-center"
                    >
                      <link.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Button>
              )}
            </div>
          ))}
        </nav>

        {/* Footer section for settings or user info */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-center"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

// Main App component to demonstrate the sidebar usage.
export default function Test() {
  // State to manage whether the sidebar is collapsed or not.
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle function to switch the collapsed state.
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // A mock array of navigation links. In a real app, this would come from a configuration file or API.
  const navLinks = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/profile", icon: User },
    { label: "History", href: "/history", icon: History },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Render the Sidebar component, passing the state and the toggle function as props. */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        links={navLinks}
      />
      {/* The main content area of the application. */}
      <main
        className={`flex-1 p-8 bg-gray-50 transition-all duration-300 ease-in-out`}
      >
        <h2 className="text-3xl font-semibold mb-4">Main Content</h2>
        <p>
          This is the main content area. The sidebar on the left will expand and
          shrink.
        </p>
      </main>
    </div>
  );
}
