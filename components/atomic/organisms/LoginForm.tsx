"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input, Label } from "@/components/atomic/atoms";
import { AppLogo, AuthFooterLink, AuthHeading } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { login } from "@/lib/api/auth/login.api";
import { setUser } from "@/store/slices/user.slice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

export function LoginForm({ isAdmin = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onGoogleSignIn() {
    router.push("/signin/role-selection");
  }

  useEffect(() => {
    if (isAdmin) return;

    const authError =
      searchParams.get("authError") ??
      searchParams.get("message") ??
      searchParams.get("error_description") ??
      searchParams.get("error");

    if (!authError) return;

    toast.error(authError);
    router.replace("/signin");
  }, [isAdmin, router, searchParams, toast]);

  async function onLogin(values: LoginValues) {
    try {
      setIsSubmitting(true);
      const { user } = await login(values.email, values.password);
      dispatch(setUser(user));
      toast.success('Authenticated');
      router.replace(`/${String(user.role).toLowerCase()}`);
    } catch (err: unknown) {
      form.setError("root", {
        message: getErrorMessage(err, "Login failed. Try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <AppLogo />
      <AuthHeading
        title={ !isAdmin ? "Sign in to your account" : "Admin Panel"}
        subtitle="Enter your credentials to continue"
      />
      {!isAdmin && 
      <Button type="button" variant="outline" className="w-full rounded-full" onClick={onGoogleSignIn} disabled={isSubmitting}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5c3.3 6.5 10.1 10.9 17.7 10.9z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.7l6.3 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
        </svg>
        Continue with Google
      </Button>
      }


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="login-email">Email</Label>
                <FormControl>
                  <Input id="login-email" placeholder="e.g. alex@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="login-password">Password</Label>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="login-password"
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
          {!isAdmin && 
            <div className="flex flex-row-reverse">
              <Button variant="link" className="h-auto p-0 font-medium">
                <Link href="/forgot-password">Forgot Password ?</Link>
              </Button>
            </div>
            }
          </div>

          {form.formState.errors.root && (
            <p className="text-xs text-red-500 text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    { !isAdmin && 
      <AuthFooterLink label="Don&apos;t have an account?" href="/signup" action="Create one" />
    }
    </AuthPageShell>
  );
}

export default LoginForm;
