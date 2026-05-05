import Link from "next/link";

import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="px-4 py-4 max-w-md mx-auto w-full flex justify-between items-center">
        <Link href="/" className="font-display font-semibold text-ink">
          DeenNotes
        </Link>
        <Link href="/login" className="text-sm text-accent font-medium">
          Sign in
        </Link>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-24">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Create your account
          </h1>
          <p className="text-muted mt-2 mb-8">
            Start turning khutbahs and reminders into structured reflection.
          </p>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
