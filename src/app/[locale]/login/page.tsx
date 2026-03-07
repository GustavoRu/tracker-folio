import React from "react";
import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/AuthForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(params);
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <AuthForm />
    </div>
  );
}
