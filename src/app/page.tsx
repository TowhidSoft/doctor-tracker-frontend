import { redirect } from "next/navigation";

// The portal has no public pages: signed-in admins go to the dashboard, everyone else is
// sent to /login by src/middleware.ts.
export default function Home() {
  redirect("/dashboard");
}
