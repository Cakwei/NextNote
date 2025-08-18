import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Body } from "@/app/dashboard/component/body";

{
  /* Dynamic Imports */
}

export default async function Dashboard() {
  return (
    <div className="p-5 bg-[#f9f9f9] ">
      <Suspense
        fallback={
          <Skeleton className="w-full h-dvh justify-center flex items-center">
            Loading Components...
          </Skeleton>
        }
      >
        <Body />
      </Suspense>
    </div>
  );
}
