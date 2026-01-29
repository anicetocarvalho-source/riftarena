import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
}

const calculateStrength = (password: string): StrengthResult => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score: 25, label: "Weak", color: "bg-destructive" };
  } else if (score <= 3) {
    return { score: 50, label: "Fair", color: "bg-warning" };
  } else if (score <= 4) {
    return { score: 75, label: "Good", color: "bg-primary" };
  } else {
    return { score: 100, label: "Strong", color: "bg-success" };
  }
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span className={cn(
          "text-xs font-display uppercase tracking-wider",
          strength.score <= 25 && "text-destructive",
          strength.score === 50 && "text-warning",
          strength.score === 75 && "text-primary",
          strength.score === 100 && "text-success"
        )}>
          {strength.label}
        </span>
      </div>
      <Progress 
        value={strength.score} 
        className="h-1.5 bg-secondary"
        indicatorClassName={strength.color}
      />
      <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
        <li className={cn(password.length >= 8 && "text-success")}>
          • At least 8 characters
        </li>
        <li className={cn(/[A-Z]/.test(password) && /[a-z]/.test(password) && "text-success")}>
          • Upper & lowercase letters
        </li>
        <li className={cn(/[0-9]/.test(password) && "text-success")}>
          • At least one number
        </li>
        <li className={cn(/[^a-zA-Z0-9]/.test(password) && "text-success")}>
          • At least one special character
        </li>
      </ul>
    </div>
  );
};
