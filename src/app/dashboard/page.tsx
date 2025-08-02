import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const NoteComponent = dynamic(() =>
  import("@/app/dashboard/ui/note").then((module) => module.Note)
);

export default async function Dashboard() {
  return (
    <div className="p-5 bg-[#f9f9f9]">
      <Suspense fallback={<Skeleton className="w-full h-dvh justify-center flex items-center">Loading</Skeleton>}>
        <NoteComponent />
      </Suspense>
    </div>
  );
}
