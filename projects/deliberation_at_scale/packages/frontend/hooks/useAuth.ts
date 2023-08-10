import { useEffect, useState } from "react";
import { User } from "@supabase/gotrue-js";

import { supabase } from "@/utilities/supabase";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const updateUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      updateUser()
    })
    return () => {
      authListener.subscription.unsubscribe();
    }
  }, []);

  return {
    user,
  };
}
