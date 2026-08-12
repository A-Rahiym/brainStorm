
import { LoginForm } from "@/features/auth/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="w-full max-w-105">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl  text-white">
         <Image 
         src="/Logo.svg"
         alt="Logo"
          width={50}
          height={50}
          />
        </span>
        <h1 className="text-[26px] font-bold text-text-primary">Welcome back to Brainstorm</h1>
        <p className="mt-2 text-sm text-text-secondary">Sign in to your school account to continue</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <LoginForm />
      </div>

      <div className="mt-5 space-y-1.5 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        <p className="mb-2 font-semibold text-text-secondary">
          These logins are for development purposes only
        </p>
        <p>
          Headmaster · <span className="font-bold text-text-primary">admin@brainstorm.test</span> ·{" "}
          <span className="font-bold text-text-primary">password123</span>
        </p>
        <p>
          Teacher · <span className="font-bold text-text-primary">teacher@brainstorm.test</span> ·{" "}
          <span className="font-bold text-text-primary">password123</span>
        </p>
        <p>
          Teacher (test) · <span className="font-bold text-text-primary">yahaya.umar@brainstorm.test</span> ·{" "}
          <span className="font-bold text-text-primary">password123</span>
        </p>
      </div>
    </div>
  );
}
