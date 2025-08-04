// "use client";
import "@/app/globals.css";
export default function GlobalNotFound() {
  return (
    <html>
      <body
        style={{
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <video
          width={0}
          height={0}
          preload="none"
          autoPlay
          loop
          muted
          playsInline
          className="w-300 h-300 min-w-[250px] min-h-[250px] lg:max-w-[350px] max-w-[250px] lg:max-h-[350px] max-h-[250px]"
        >
          <source src="error.mp4" />
          Your browser does not support the video tag.
        </video>
        <h1>404 - Page Not Found</h1>
        <p>This page does not exist. But have a capybara :)</p>
      </body>
    </html>
  );
}
