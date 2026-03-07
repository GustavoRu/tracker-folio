"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, SupabaseClient } from "@supabase/supabase-js";

export function AuthButton() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setMounted(true);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16" />;
  }

  if (user) {
    return (
      <button
        onClick={async () => {
          await supabaseRef.current?.auth.signOut();
          router.push("/");
          router.refresh();
        }}
        className="flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
      >
        {t("logout")}
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/login")}
      className="flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
    >
      {t("login")}
    </button>
  );
}
