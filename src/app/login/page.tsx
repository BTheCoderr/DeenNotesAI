import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="px-4 py-4 max-w-md mx-auto w-full flex justify-between items-center">
        <Link href="/" className="font-display font-semibold text-ink">
          DeenNotes
        </Link>
        <Link href="/signup" className="text-sm text-accent font-medium">
          Sign up
        </Link>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-24">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Welcome back
          </h1>
          <p className="text-muted mt-2 mb-8">
            Sign in to continue your notes and reflections.
          </p>
          <Suspense fallback={<div className="h-48 rounded-2xl bg-black/5" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
