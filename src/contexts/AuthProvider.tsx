"use client";

import { apiEndpoint, AuthProviderProps, IUser } from "@/constants/constants";
import { axiosResponse, LoginAccount, RegisterAccount } from "@/types/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import z from "zod";

const AuthContext = createContext<AuthProviderProps>({
  user: null,
  token: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser>({
    email: null,
  });
  // eslint-disable-next-line
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();

  async function register(
    e: FormEvent<HTMLFormElement>,
    formData: RegisterAccount
  ) {
    try {
      e.preventDefault();
      setLoading(true);
      const isEmail = z.email().parse(formData.email);
      const isPasswordString = z.string().parse(formData.password);

      if (isEmail && isPasswordString) {
        const results: axiosResponse = await axios.post(apiEndpoint.register, {
          email: formData.email,
          password: formData.password,
        });

        if (results.data.status === "Success") {
          navigation.push("/login");
        }
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  async function login(e: FormEvent<HTMLFormElement>, formData: LoginAccount) {
    try {
      e.preventDefault();
      setLoading(true);
      const isEmail = z.email().parse(formData.email);
      const isPasswordString = z.string().parse(formData.password);

      if (isEmail && isPasswordString) {
        const result: axiosResponse = await axios.post(
          apiEndpoint.login,
          {
            email: formData.email,
            password: formData.password,
          },
          { withCredentials: true }
        );
        if (result.data.status === "Success") {
          setUser({ email: result.data.data.email as string });
          navigation.push("/dashboard");
        }
      }

      // setProcessing(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  async function logout() {
    try {
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function refreshSession() {
      const result: axiosResponse = await axios.post(
        apiEndpoint.login,
        {},
        { withCredentials: true }
      );
      if (result.data.status === "Success") {
        console.log(result.data);
        setUser({ email: result.data.data.email as string });
      }
    }
    refreshSession();
  }, []);

  return (
    <AuthContext value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw Error("AuthContext must be inside AuthProvider.");
  }
  return context;
};
