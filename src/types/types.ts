import { AxiosResponse } from "axios";

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
