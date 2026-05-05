import Link from "next/link";

import { DeenNotesLogo } from "@/components/brand/DeenNotesLogo";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="px-4 py-4 max-w-md mx-auto w-full flex justify-end items-center">
        <Link
          href="/login"
          className="text-sm text-accent font-medium rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Sign in
        </Link>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 pt-2 pb-24">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-10">
            <Link
              href="/"
              aria-label="DeenNotes home"
              className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <DeenNotesLogo size="lg" />
            </Link>
          </div>
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
