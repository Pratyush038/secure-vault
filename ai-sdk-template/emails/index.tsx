import * as React from "react";

interface SupaAuthVerifyEmailProps {
  verificationCode: string;
}

export default function SupaAuthVerifyEmail({ verificationCode }: SupaAuthVerifyEmailProps) {
  return (
    <div>
      <p>Your verification code is: {verificationCode}</p>
    </div>
  );
}
