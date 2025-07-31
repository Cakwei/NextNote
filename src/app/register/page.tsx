import dynamic from "next/dynamic";

{
  /* Dynamic Imports */
}
const LoginFormComponent = dynamic(() => import("@/app/register/ui/form"));
const LoginBackgroundComponent = dynamic(
  () => import("@/app/register/ui/background")
);

export default function Login() {
  return (
    <LoginBackgroundComponent>
      <LoginFormComponent></LoginFormComponent>
    </LoginBackgroundComponent>
  );
}
