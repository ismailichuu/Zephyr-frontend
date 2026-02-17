"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { Button, Card, CardContent } from "@/components/atomic/atoms";
import { AppLogo, AuthHeading, OtpInputRow } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { verifyOtp } from "@/lib/api/auth/verify-otp.api";
import { setUser } from "@/store/slices/user.slice";
import { resendOtp } from "@/lib/api/auth/resend-otp.api";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

export function EmailVerification({ isForgot = false }: { isForgot?: boolean }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    try {
      setOtpError("");
      setLoading(true);
      const type = isForgot ? 'forgot' : 'signup';

      const { user } = await verifyOtp(code, type);

      if (!isForgot && user) {
        dispatch(setUser(user));
        router.replace(`/${user.role.toLowerCase()}`);
      } else {
        router.replace("/forgot-password/reset");
      }
    } catch (error: unknown) {
      setOtpError(getErrorMessage(error, "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    let countDown = 60;
    setSeconds(countDown);

    const interval = setInterval(() => {
      countDown--;
      setSeconds(countDown);

      if (countDown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  const resendOtpHandler = async () => {
    if (seconds > 0) return;

    try {
      setOtpError("");
      startTimer();

      const res = await resendOtp();
      if (res) setMessage('OTP Sent Successfully');
      const messageTime = setTimeout(() => {
        setMessage("");
        clearTimeout(messageTime);
      }, 10000)

    } catch (error: unknown) {
      setOtpError(getErrorMessage(error, "Invalid OTP. Please try again."));
    }
  }

  return (
    <AuthPageShell>
      <AppLogo />

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <AuthHeading
            title="Verify Your Email"
            subtitle="We've sent a 6-digit code to your email address. Please enter it below."
            className="space-y-2"
          />

          <OtpInputRow value={code} onChange={setCode} />

          <div className="flex justify-center">
          </div>
          <div className="flex flex-col justify-center text-center">
            <p className="text-xs text-red-500">{otpError}</p>
            {seconds > 0 ? <p className="text-xs text-red-500">{seconds}&apos;s remaining</p>
              : <button className="text-blue-500 text-sm font-medium" onClick={resendOtpHandler}>Resend otp</button>}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full rounded-full"
            disabled={code.length !== 6 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
      <div className="flex justify-center text-center">
        <p className="text-green-500 text-xs">{message}</p>
      </div>
        </CardContent>
      </Card>

      <Button variant="link" onClick={() => router.replace('/signup')} className="w-full gap-1 text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Signup
      </Button>
    </AuthPageShell>
  );
}

export default EmailVerification;
