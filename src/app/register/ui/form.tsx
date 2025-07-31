"use client";

import { Colors } from "@/constants/constants";
import { appleFont } from "../../layout";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";

{
  /* Dynamic Imports */
}
const ButtonComponent = dynamic(() =>
  import("@/components/ui/button").then((module) => ({
    default: module.Button,
  }))
);
const InputComponent = dynamic(() =>
  import("@/components/ui/input").then((module) => ({
    default: module.Input,
  }))
);

type UserAccount = {
  email: string;
  password: string;
};

export default function RegisterForm({ children }: { children?: ReactNode }) {
  const navigation = useRouter();
  const [formData, setFormData] = useState<UserAccount>({
    email: "",
    password: "",
  });

  async function register(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const results = await axios.post(`api/register`, {
        email: formData.email,
        password: formData.password,
      });
      if (results) {
        console.log(results);
      }
    } catch (e) {
      console.error(e);
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

  useEffect(() => {
    console.log(JSON.stringify(formData));
  }, [formData, setFormData]);
  return (
    <>
      <form
        onSubmit={register}
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
          <Suspense
            fallback={
              <Skeleton className="w-full h-full mt-5 min-h-25 min-w-25 lg:max-w-[350px] max-w-[250px] lg:max-h-[350px] max-h-[250px]" />
            }
          >
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
          </Suspense>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-2.5">
          <h1 className="font-bold text-2xl text-center">Account Sign Up</h1>
          <div className="flex flex-col gap-5">
            <InputComponent
              onChange={handleInputChange}
              name="email"
              placeholder="Email"
              className="py-5"
            />

            <InputComponent
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
            <ButtonComponent
              className={`bg-[#0066cc] hover:bg-[#0066cc]/75 py-5 text-md  ${appleFont.className}`}
              title="Press to attempt login"
            >
              Register
            </ButtonComponent>
          </div>
        </div>

        {/* Quick Options*/}
      </form>
      {children}
    </>
  );
}
