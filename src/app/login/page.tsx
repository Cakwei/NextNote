"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
export default function Home() {
  return (
    <div className="h-dvh w-full flex bg-[#f9f9f9] place-content-center place-items-center font-[family-name:var(--font-geist-sans)]">
      <form className="rounded-2xl flex p-5 flex-col min-w-[450px] drop-shadow-xl shadow-accent bg-white h-[55%]">
        {/* Title */}
        <div className="flex justify-center">
          <label className="rounded-2xl drop-shadow-xl shadow-accent p-2.5  bg-[#f9f9f9]">
            <LogOut size={25} />
          </label>
        </div>
        <h1 className="font-bold text-2xl text-center">Login with email</h1>
        {/* Inputs */}
        <div>
          <div>
            <label></label>
            <Input />
          </div>
          <div>
            <label></label>
            <Input />
          </div>
          <Button
            title="Press to attempt login"
            onClick={(e) => {
              e.preventDefault();
              toast.error("lol");
            }}
          >
            Login
          </Button>
        </div>

        {/* Quick Options*/}
      </form>
    </div>
  );
}
