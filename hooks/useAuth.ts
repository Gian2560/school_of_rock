
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

interface CustomUser {
  role?: string;
}

interface CustomSession {
  user?: CustomUser;
  expires: string;
}

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.expires) {
      const tokenExp = new Date(session.expires).getTime();
      const currentTime = Date.now();
      if (currentTime >= tokenExp) {
        console.log("🔄 Sesión expirada. Cerrando sesión.");
        signOut();
      }
    }
  }, [session]);

  return {
    isAuthenticated: status === "authenticated",
  userRole: (session?.user as CustomUser)?.role ?? "guest",
    loading: status === "loading",
  };
}
