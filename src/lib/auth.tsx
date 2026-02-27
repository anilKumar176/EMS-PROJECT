import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AppRole = "admin" | "vendor" | "user";

interface AuthState {
  user: User | null;
  profileId: string | null;
  role: AppRole | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: AppRole, categoryId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profileId: null,
    role: null,
    loading: true,
  });

  const fetchRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", userId)
      .single();

    if (!profile) return { profileId: null, role: null as AppRole | null };

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .single();

    return { profileId: profile.id, role: (roleData?.role as AppRole) ?? null };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid deadlock with Supabase auth
          setTimeout(async () => {
            const { profileId, role } = await fetchRole(session.user.id);
            setState({ user: session.user, profileId, role, loading: false });
          }, 0);
        } else {
          setState({ user: null, profileId: null, role: null, loading: false });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { profileId, role } = await fetchRole(session.user.id);
        setState({ user: session.user, profileId, role, loading: false });
      } else {
        setState({ user: null, profileId: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, role: AppRole, categoryId?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, category_id: categoryId },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
