export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-stone-50 text-ink antialiased">{children}</div>
  );
}
