"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, Card, CardContent, Input, Label } from "@/components/atomic/atoms";
import { AppLogo, AuthHeading } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { forgotPassword } from "@/lib/api/auth/forgot-password.api";
import { useToast } from "@/components/providers/toast-provider";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

export function ForgotPassword() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsSubmitting(true);
      await forgotPassword(data.email);
      toast.success('Email Sent Successfully');
      router.replace("/forgot-password/verification");
    } catch (err: unknown) {
      setError("root", {
        message: getErrorMessage(err, "Forgot password failed. Try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell>
      <AppLogo />

      <Card className="border shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>

          <AuthHeading
            title="Forgot Password ?"
            subtitle="Enter your email address and we'll send you a link to reset your password"
            className="space-y-2"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@gmail.com"
                className={`bg-muted border-0 ${errors.email ? "ring-1 ring-red-500" : ""}`}
                {...register("email")}
              />

              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Continue"
              )}
            </Button>

            {errors.root && <p className="text-xs text-red-500 text-center">{errors.root.message}</p>}
          </form>

          <Button variant="link" className="w-full gap-1 text-primary">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/signin">Back to SignIn</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}

export default ForgotPassword;
