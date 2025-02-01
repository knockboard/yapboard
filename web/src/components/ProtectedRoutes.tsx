import type { ReactNode } from "react";
import useUserStore from "../store/userStore";

export default function ProtectedRoutes({ children }: { children: ReactNode }) {
  const user = useUserStore((state) => state.user);

  if (!user.token.length) {
    return (window.location.href = "/auth/sign-in/");
  }

  return <div>{children}</div>;
}
