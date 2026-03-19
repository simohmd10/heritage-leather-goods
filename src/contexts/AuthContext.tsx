import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string, email: string): Promise<User | null> {
  const query = supabase.from('profiles').select('*').eq('id', userId).single();
  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 6000));
  const result = await Promise.race([query, timeout]);
  if (result === null) return null; // timed out
  const { data, error } = result;
  if (error || !data) return null;
  return {
    id: userId,
    email,
    name: data.name,
    phone: data.phone ?? undefined,
    role: data.role,
    created_at: data.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialised = false;

    const done = () => {
      if (!initialised) { initialised = true; clearTimeout(hardTimer); setLoading(false); }
    };

    // Hard fallback: if nothing resolves in 10s (wrong env vars / deleted project),
    // stop the loading spinner so the user isn't stuck forever.
    const hardTimer = setTimeout(() => {
      if (!initialised) { initialised = true; setUser(null); setLoading(false); }
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user ? await fetchProfile(session.user.id, session.user.email!) : null);
      } catch {
        setUser(null);
      } finally {
        done();
      }
    });

    // Fallback: if onAuthStateChange never fires resolve via getSession
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (initialised) return;
      try {
        if (session?.user) setUser(await fetchProfile(session.user.id, session.user.email!));
      } catch {
        setUser(null);
      } finally {
        done();
      }
    }).catch(() => done());

    return () => { subscription.unsubscribe(); clearTimeout(hardTimer); };
  }, []);

  const login = async (email: string, password: string) => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out — your Supabase project may be paused. Visit supabase.com to resume it.')), 15000)
    );
    const attempt = supabase.auth.signInWithPassword({ email, password });
    const { error } = await Promise.race([attempt, timeout]) as Awaited<typeof attempt>;
    if (error) {
      if (error.message.includes('Invalid login credentials'))
        throw new Error('Invalid email or password. Make sure the admin account exists in Supabase Authentication.');
      throw new Error(error.message);
    }
    // User state is updated automatically via onAuthStateChange
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone: phone ?? null } },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const profile = await fetchProfile(authUser.id, authUser.email!);
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
