import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-poppins text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold text-secondary-dark">This page does not exist</h1>
      <p className="max-w-sm text-sm text-text-secondary">The link may be broken or the page may have been moved.</p>
      <Link href="/dashboard" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark">
        Back to the dashboard
      </Link>
    </main>
  );
}
