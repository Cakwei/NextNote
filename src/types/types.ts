import { AxiosResponse } from "axios";
import { LucideIcon } from "lucide-react";

export interface axiosResponse extends AxiosResponse {
  data: {
    status: string;
    data: { [key: string]: string | string[] | INotesTableArray[]};
    message: string;
  };
}

export type LoginAccount = {
  email: string;
  password: string;
};

export type RegisterAccount = { email: string; password: string };

export type NavLink = { label: string; href: string; icon: LucideIcon }[];

export type INotes = {
  id?: string;
  title?: string;
  data?: string;
  creationDate?: string;
  modifiedDate?: string;
};

export type INotesTableArray = {
  noteId: string;
  title: string;
  data: string;
  creationDate: string;
  modifiedDate: string;
};
