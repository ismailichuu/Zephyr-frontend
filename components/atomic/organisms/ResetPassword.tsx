"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, Card, CardContent, Input, Label } from "@/components/atomic/atoms";
import { AppLogo, AuthHeading } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { useToast } from "@/components/providers/toast-provider";
import { resetPassword } from "@/lib/api/auth/reset-password.api";

const resetPasswordSchema = z
  .object({
    password: z.string().min(7, "Password must be at least 7 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      return String((error as { message?: unknown }).message ?? fallback);
    }
    return fallback;
  };

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      setIsSubmitting(true);
      await resetPassword(data.password);
      toast.success("Password changed successfully");
      router.replace("/signin");
    } catch (err: unknown) {
      setError("root", {
        message: getErrorMessage(err, "Forgot password failed. Try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell maxWidth="md">
      <AppLogo />

      <Card className="border shadow-sm">
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>

          <AuthHeading
            title="Reset Password"
            subtitle="Choose a strong password for your account"
            className="space-y-2"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`h-11 border-0 bg-muted pr-10 ${errors.password ? "ring-1 ring-red-500" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className={`h-11 border-0 bg-muted ${errors.confirmPassword ? "ring-1 ring-red-500" : ""}`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
              {errors.root && <p className="text-xs text-red-500 text-center">{errors.root.message}</p>}
            <div className="pt-2">
              <Button type="submit" className="mx-auto block w-3/5 rounded-full" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Continuing...
                  </>
                ) : (
                  "continue"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}

export default ResetPassword;
