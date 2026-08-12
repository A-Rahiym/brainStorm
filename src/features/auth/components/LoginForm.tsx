"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/request";
import { FormField } from "@/components/forms/FormField";
import { Button, Input } from "@/components/ui";
import { useLogin } from "@/features/auth/hooks/mutations/useLogin";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onError: (err) => {
        if (err instanceof ApiError && err.code === "UNAUTHORIZED") {
          setError("password", { message: "Invalid email or password" });
          return;
        }
        setError("root", {
          message: err instanceof Error && err.message ? err.message : "Unable to sign in. Try again.",
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Email address" name="email" error={errors.email}>
        <Input
          type="email"
          placeholder="you@school.edu.ng"
          autoComplete="email"
          invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>
      <FormField label="Password" name="password" error={errors.password}>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            invalid={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FormField>
      {errors.root && (
        <p role="alert" className="text-xs font-medium text-danger-text">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" loading={login.isPending} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
