import { AxiosResponse } from "axios";

export interface axiosResponse extends AxiosResponse {
  data: {
    status: string;
    data: object;
    message: string;
    code: number;
  };
}
