import { Home, LogOut, LucideIcon, LucideProps, User } from "lucide-react";
import {
  CSSProperties,
  ForwardRefExoticComponent,
  HTMLAttributes,
  HTMLProps,
  ReactNode,
  RefAttributes,
} from "react";

export const Colors = {
  applePrimary: "#0066cc",
  white: "#ffffff",
  black: "#000000",
};

export const apiEndpoint = {
  login: "api/auth/login",
  register: "api/auth/register",
  logout: "api/auth/logout",
};

export const protectedRoutes = ["/dashboard"];

export const unprotectedRoutes = ["/Login", "/register"];

export const metadataInfo = {
  default: "NextNote",
  dashboard: "NextNote - Dashboard",
  login: "NextNote - Login",
  register: "NextNote - Register",
};

export const metadataDescription = {
  default: "Created by Cakwei",
};

export const fontSizes = [
  "12px",
  "14px",
  "16px",
  "18px",
  "24px",
  "32px",
  "64px",
  "128px",
];

export const fontFamilies = [
  { label: "SF Pro Display", value: "SF Pro Display" },
  { label: "Sans Serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Arial", value: "Arial" },
  { label: "Verdana", value: "Verdana" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier New", value: "Courier New" },
  { label: "Lucida Console", value: "Lucida Console" },
  { label: "Impact", value: "Impact" },
  { label: "Comic Sans MS", value: "Comic Sans MS" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
  { label: "Cursive", value: "cursive" },
  { label: "Fantasy", value: "fantasy" },
  { label: "System UI", value: "system-ui" },
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Montserrat", value: "Montserrat" },
];

type SideBarLinks = {
  title: string;
  url: string;
  icon: LucideIcon;
  className: HTMLProps<HTMLElement>["className"];
}[];

export const sideBarLinks: SideBarLinks = [
  { title: "Profile", url: "/profile", icon: User, className: "" },
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
    className: "text-red-400 hover:text-red-400",
  },
];
