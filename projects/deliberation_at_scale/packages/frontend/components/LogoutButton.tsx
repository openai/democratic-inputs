import { supabase } from "@/state/supabase";

export default function LogoutButton() {
  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <button onClick={logout} className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
      Logout
    </button>
  );
}
