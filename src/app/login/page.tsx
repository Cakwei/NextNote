"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { appleFont } from "../layout";
import { Colors } from "@/constants/constants";
import { useRouter } from "next/navigation";

export default function Login() {
  const navigation = useRouter();

  return (
    <div className="lg:landscape:h-dvh lg:landscape:[@media(max-height:645px)]:h-auto w-full flex bg-[#f9f9f9] place-content-center place-items-center font-[family-name:var(--font-geist-sans)]">
      <form className="h-full sm:h-auto lg:rounded-2xl flex p-5 flex-col min-w-[100px] w-full lg:max-w-[450px] lg:drop-shadow-xl lg:shadow-accent bg-white">
        {/* Title */}
        <div className="flex justify-center">
          <label
            onClick={(e) => {
              e.preventDefault();
              toast.message("lol", {
                description: "ffdd",
                descriptionClassName: "bg-black text-black",
              });
            }}
            className="rounded-2xl drop-shadow-xl shadow-accent p-2.5  bg-[#f9f9f9]"
          >
            <LogOut size={25} />
          </label>
        </div>

        {/* Video Animation */}
        <div className="flex justify-center">
          <video
            width="0"
            preload="none"
            autoPlay
            loop
            muted
            playsInline
            className="w-[100%] lg:max-w-[350px] max-w-[250px] "
          >
            <source src="/Login.mp4" type="video/mp4" />
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
            <Input placeholder="Email" className="py-5" />

            <Input placeholder="Password" className="py-5" />
          </div>
          <div className="text-center flex-col flex text-sm gap-2.5">
            <label className="text-zinc-400">
              Don't have an account?{" "}
              <span
                onClick={() => navigation.push("/register")}
                style={{ color: Colors.applePrimary }}
                className="hover:underline underline-offset-2 active:underline focus:underline"
              >
                Register now
              </span>
            </label>
            <Button
              className={`bg-[#0066cc] hover:bg-[#0066cc]/75 py-5 text-md  ${appleFont.className}`}
              title="Press to attempt login"
              onClick={(e) => {
                e.preventDefault();
                toast("lol", {
                  action: <Button onClick={() => alert('df')}>ffd</Button>,
                });
              }}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Quick Options*/}
      </form>
    </div>
  );
}
