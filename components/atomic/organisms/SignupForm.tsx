"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
} from "@/components/atomic/atoms";
import { AppLogo, AuthFooterLink, AuthHeading } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { useToast } from "@/components/providers/toast-provider";
import { signup } from "@/lib/api/auth/signup.api";
import { ROUTES } from "@/lib/constants/routes.constants";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(7, "At least 7 characters"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;
const AUTH_ERROR_CODE_TO_MESSAGE: Record<string, string> = {
  ROLE_MISMATCH: "This Google account is already registered with a different role.",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

export function SignupForm({ role }: { role: "freelancer" | "client" }) {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  useEffect(() => {
    const cookiePrefix = "authErrorToast=";
    const authErrorCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(cookiePrefix));
    const cookieMessage = authErrorCookie ? decodeURIComponent(authErrorCookie.slice(cookiePrefix.length)) : "";

    const currentUrl = new URL(window.location.href);
    const errorCode = currentUrl.searchParams.get("authErrorCode");
    const urlMessage = errorCode ? AUTH_ERROR_CODE_TO_MESSAGE[errorCode] ?? "Authentication failed. Please try again." : "";
    const authError = cookieMessage || urlMessage;

    if (authError) {
      toast.error(authError);
    }

    if (cookieMessage) {
      document.cookie = "authErrorToast=; path=/; max-age=0";
    }

    if (errorCode) {
      currentUrl.searchParams.delete("authErrorCode");
      window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    }
  }, [toast]);

  async function onCreateAccount(values: SignupValues) {
    try {
      setIsSubmitting(true);
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
        role: role.toUpperCase(),
      });
      toast.success('Email Sent Successfully');
      router.push(ROUTES.SIGNUP.OTP_VERIFICATION);
    } catch (err: unknown) {
      form.setError("root", {
        message: getErrorMessage(err, "Signup failed. Try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onGoogleSignup() {
    const url = new URL("/auth/google", window.location.origin);
    url.searchParams.set("role", role.toUpperCase());
    url.searchParams.set("isLogin", "false");
    url.searchParams.set("redirectOnError", `/signup?role=${role}`);
    window.location.href = url.toString();
  }

  return (
    <AuthPageShell>
      <AppLogo />
      <AuthHeading
        title="Create your account"
        subtitle="Get started in less than 2 minutes"
      />

      <Button type="button" variant="outline" className="w-full rounded-full" onClick={onGoogleSignup} disabled={isSubmitting}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5c3.3 6.5 10.1 10.9 17.7 10.9z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.7l6.3 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
        </svg>
        Continue with Google
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateAccount)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="signup-name">Name</Label>
                <FormControl>
                  <Input id="signup-name" placeholder="e.g. Alex Johnson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="signup-email">Email</Label>
                <FormControl>
                  <Input id="signup-email" placeholder="e.g. alex@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="signup-password">Password</Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="e.g. Alex@1234"
                      className="pr-10"
                      {...field}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="e.g. Alex@1234"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="terms" className="text-xs">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-xs text-red-500 text-center">{form.formState.errors.root.message}</p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
             {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <AuthFooterLink label="Already have an account?" href="/signin" action="Sign In" />
    </AuthPageShell>
  );
}

export default SignupForm;
