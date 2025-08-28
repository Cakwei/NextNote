import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

{
  /* Dynamic Imports */
}
const NoteComponent = dynamic(() =>
  import("@/app/note/ui/note").then((module) => module.Note)
);

export default async function Note() {
  return (
    <div className="p-5 bg-[#f9f9f9] ">
      <Suspense
        fallback={
          <Skeleton className="w-full h-dvh justify-center flex items-center">
            Loading Editor...
          </Skeleton>
        }
      >
        <NoteComponent />
      </Suspense>
    </div>
  );
}
