import { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabase } from "@/state/supabase";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const updateUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    setUser(user);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      updateUser()
    })
    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [updateUser]);

  return {
    user,
  };
}
