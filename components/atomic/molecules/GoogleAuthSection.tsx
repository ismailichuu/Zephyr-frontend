"use client";

import { GoogleCredentialResponse, GoogleLogin } from "@react-oauth/google";

type GoogleAuthSectionProps = {
  onSuccess: (res: GoogleCredentialResponse) => void;
  onError: () => void;
  showDivider?: boolean;
};

export function GoogleAuthSection({
  onSuccess,
  onError,
  showDivider = false,
}: GoogleAuthSectionProps) {
  return (
    <>
      <div className="flex justify-center">
        <GoogleLogin onSuccess={onSuccess} onError={onError} />
      </div>
      {showDivider && (
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-xs text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
      )}
    </>
  );
}
