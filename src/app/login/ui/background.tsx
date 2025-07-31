import { ReactNode } from "react";

export default function LoginBackground({ children }: { children?: ReactNode }) {
  return (
    <div className="lg:landscape:h-dvh lg:landscape:[@media(max-height:645px)]:h-auto lg:portrait:h-dvh w-full flex bg-[#f9f9f9] place-content-center place-items-center font-[family-name:var(--font-geist-sans)]">
      {children}
    </div>
  );
}
