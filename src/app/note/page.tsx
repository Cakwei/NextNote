import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

{
  /* Dynamic Imports */
}
const NoteComponent = dynamic(() =>
  import("@/app/note/ui/note").then((module) => module.Note)
);

export default async function Note({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const id = await searchParams;

  return (
    <div className="p-5 bg-[#f9f9f9] ">
      <Suspense
        fallback={
          <Skeleton className="w-full h-dvh justify-center flex items-center">
            Loading Editor...
          </Skeleton>
        }
      >
        <NoteComponent searchParams={id} />
      </Suspense>
    </div>
  );
}
