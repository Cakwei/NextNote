"use client";

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalNotFound() {
  const navigation = useRouter();
  useEffect(() => {
    const url = window.location.href.split("/")[3];
    console.log(url);
    switch (url) {
      case "logins":
        console.log('fwefw')
        navigation.push("/login");
    }
  }, []);

  return (
    <html>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>This page does not exist.</p>
      </body>
    </html>
  );
}
