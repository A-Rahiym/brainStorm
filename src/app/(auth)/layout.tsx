import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { Providers } from "@/lib/providers";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  return (
    <Providers>
      <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">{children}</main>
    </Providers>
  );
}
