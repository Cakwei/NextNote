"use client";

import { apiEndpoint, Colors } from "@/constants/constants";
import { appleFont } from "@/lib/fonts";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { axiosResponse, LoginAccount } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import axios from "axios";

export default function LoginForm({ children }: { children?: ReactNode }) {
  const navigation = useRouter();
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<LoginAccount>({
    email: "",
    password: "",
  });

  async function login(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      setProcessing(true);
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
          navigation.push("/dashboard");
        }
      }
      // setProcessing(false);
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <>
      <form
        onSubmit={login}
        className="h-full sm:h-auto lg:rounded-2xl flex p-5 flex-col min-w-[100px] w-full lg:max-w-[450px] lg:drop-shadow-xl lg:shadow-accent bg-white"
      >
        {/* Title 
        <div className="flex justify-center">
          <label
            onClick={() => {
              navigation.push("/");
            }}
            className="rounded-2xl drop-shadow-lg shadow-accent p-2.5  bg-[#f9f9f9] hover:drop-shadow-xl"
          >
            <LogOut size={25} />
          </label>
        </div>
        */}

        {/* Video Animation */}

        <div className="flex justify-center">
          <video
            width="0"
            preload="none"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full lg:max-w-[350px] max-w-[250px] lg:max-h-[350px] max-h-[250px]"
          >
            <source src="/Login.mp4" />
            <track
              src={undefined}
              kind="subtitles"
              srcLang="en"
              label="English"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-2.5">
          <h1 className="font-bold text-2xl text-center">Login with email</h1>
          <div className="flex flex-col gap-5">
            <Input
              onChange={handleInputChange}
              name="email"
              autoComplete="email"
              placeholder="Email"
              className="py-5"
            />

            <Input
              onChange={handleInputChange}
              name="password"
              placeholder="Password"
              className="py-5"
            />
          </div>
          <div className="text-center flex-col flex text-sm gap-2.5">
            <label className="text-zinc-400">
              {"Don't have an account? "}
              <span
                onClick={() => navigation.push("/register")}
                style={{ color: Colors.applePrimary }}
                className="hover:underline underline-offset-2 active:underline focus:underline"
              >
                Sign in
              </span>
            </label>
            <Button
              type="submit"
              disabled={processing}
              className={`bg-[#0066cc] hover:bg-[#0066cc]/75 py-5 text-md  ${appleFont.className}`}
              title="Press to attempt login"
            >
              {processing ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>

        {/* Quick Options*/}
      </form>
      {children}
    </>
  );
}
