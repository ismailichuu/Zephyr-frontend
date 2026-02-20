import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/atomic/atoms";

type OtpInputRowProps = {
  value: string;
  onChange: (value: string) => void;
};

export function OtpInputRow({ value, onChange }: OtpInputRowProps) {
  return (
    <div className="flex justify-center">
      <InputOTP maxLength={6} value={value} onChange={onChange}>
        <InputOTPGroup>
          <InputOTPSlot index={0} className="bg-primary/10 border-0" />
          <InputOTPSlot index={1} className="bg-primary/10 border-0" />
          <InputOTPSlot index={2} className="bg-primary/10 border-0" />
          <InputOTPSlot index={3} className="bg-primary/10 border-0" />
          <InputOTPSlot index={4} className="bg-primary/10 border-0" />
          <InputOTPSlot index={5} className="bg-primary/10 border-0" />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
