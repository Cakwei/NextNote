import dynamic from "next/dynamic";

{
  /* Dynamic Imports */
}
const LoginFormComponent = dynamic(() => import("@/app/login/ui/form"));
const LoginBackgroundComponent = dynamic(
  () => import("@/app/login/ui/background")
);

export default function Login() {
  return (
    <LoginBackgroundComponent>
      <LoginFormComponent></LoginFormComponent>
    </LoginBackgroundComponent>
  );
}
