import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type CustomerSession =
  | { status: "loading"; user: null }
  | { status: "guest"; user: null }
  | { status: "user"; user: User };

// Sessão do Supabase Auth no browser (cliente ou admin: é o mesmo login).
export function useCustomerSession(): CustomerSession {
  const [session, setSession] = useState<CustomerSession>({ status: "loading", user: null });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession ? { status: "user", user: authSession.user } : { status: "guest", user: null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}
