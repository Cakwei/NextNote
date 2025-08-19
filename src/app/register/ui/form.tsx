"use client";

import { Colors } from "@/constants/constants";
import { appleFont } from "@/lib/fonts";
import { useRouter } from "next/navigation";
import { ChangeEvent, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegisterAccount } from "@/types/types";
import { useAuth } from "@/contexts/AuthProvider";

export default function RegisterForm({ children }: { children?: ReactNode }) {
  const navigation = useRouter();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState<RegisterAccount>({
    email: "",
    password: "",
  });

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
        onSubmit={(e) => register(e, formData)}
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
            className="w-full h-full lg:max-w-[350px] max-w-[250px] lg:max-h-[350px] max-h-[250px] "
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
          <h1 className="font-bold text-2xl text-center">Account Sign Up</h1>
          <div className="flex flex-col gap-5">
            <Input
              onChange={handleInputChange}
              name="email"
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
              Existing user?{" "}
              <span
                onClick={() => navigation.push("/login")}
                style={{ color: Colors.applePrimary }}
                className="hover:underline underline-offset-2 active:underline focus:underline"
              >
                Sign in
              </span>
            </label>
            <Button
              className={`bg-[#0066cc] hover:bg-[#0066cc]/75 py-5 text-md  ${appleFont.className}`}
              title="Press to attempt login"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </div>
        </div>

        {/* Quick Options*/}
      </form>
      {children}
    </>
  );
}
