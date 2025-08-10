import { AxiosResponse } from "axios";
import { LucideIcon } from "lucide-react";

export interface axiosResponse extends AxiosResponse {
  data: {
    status: string;
    data: object;
    message: string;
    code: number;
  };
}

export type LoginAccount = {
  email: string;
  password: string;
};

export type RegisterAccount = { email: string; password: string };

export type NavLink = { label: string; href: string; icon: LucideIcon }[];
