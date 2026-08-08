"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
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
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register("password")}
        />
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
