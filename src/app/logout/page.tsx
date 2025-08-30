"use client";
import { apiEndpoint } from "@/constants/constants";
import { axiosResponse } from "@/types/types";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Logout() {
  const [loading, setLoading] = useState(false);
  const [loggedOut, setLoggedOut] = useState<boolean | null>(null);

  useEffect(() => {
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
          setTimeout(() => (window.location.href = "/"), 500);
        }
      } catch {
        setLoading(false);
      }
    }
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
