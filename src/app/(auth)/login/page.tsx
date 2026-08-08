import { LogoIcon } from "@/components/icons";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <LogoIcon size={28} />
        </span>
        <h1 className="text-[26px] font-extrabold text-text-primary">Welcome back to Brainstorm</h1>
        <p className="mt-2 text-sm text-text-secondary">Sign in to your school account to continue</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <LoginForm />
      </div>

      <p className="mt-5 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        Demo account · <span className="font-bold text-text-primary">admin@brainstorm.test</span> ·{" "}
        <span className="font-bold text-text-primary">password123</span>
      </p>
    </div>
  );
}
