"use client";
import { apiEndpoint } from "@/constants/constants";
import { axiosResponse } from "@/types/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Logout() {
  const [loading, setLoading] = useState(false);
  const [loggedOut, setLoggedOut] = useState<boolean | null>(null);
  const navigation = useRouter();

  async function logOut() {
    try {
      const result: axiosResponse = await axios.post(
        `${apiEndpoint.logout}`,
        {},
        { withCredentials: true }
      );
      if (result.data.status === "Success") {
        setLoggedOut(true);
        setLoading(false);
        setTimeout(() => navigation.push("/login"), 500);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  }

  useEffect(() => {
    logOut();
  }, []);
  return (
    <div className="flex justify-center w-dvw h-dvh items-center">
      {loading
        ? "Logging you out..."
        : loggedOut === null
        ? ""
        : loggedOut
        ? "See you again!"
        : "An error occurred!"}
    </div>
  );
}
