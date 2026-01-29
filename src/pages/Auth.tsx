import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User, Globe, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland", "France",
  "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia", "Ireland",
  "Israel", "Italy", "Japan", "Malaysia", "Mexico", "Netherlands", "New Zealand",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania",
  "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
  "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
];

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  country: z.string().min(2, "Please select your country"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const validation = signUpSchema.safeParse({ email, password, confirmPassword, username, country });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, username, country);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success("Account created successfully! Welcome to RIFT.");
        navigate("/dashboard");
      } else {
        const validation = signInSchema.safeParse({ email, password });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success("Welcome back to RIFT!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-rift opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />

      {/* Back Link */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-display text-sm uppercase tracking-wider">Back to Home</span>
      </Link>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-sm border border-border bg-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <RiftLogo size="lg" showTagline />
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 font-display text-sm uppercase tracking-wider rounded-sm border transition-all ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 font-display text-sm uppercase tracking-wider rounded-sm border transition-all ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-destructive">{errors.username}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="pl-10 bg-secondary border-border">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] bg-card border-border">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.country && (
                    <p className="mt-1 text-xs text-destructive">{errors.country}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
              {mode === "signup" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="rift"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Creating Account..." : "Signing In..."}
                </>
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Role Info */}
          {mode === "signup" && (
            <div className="mt-6 p-4 rounded-sm bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                New accounts start as <Badge variant="default" size="sm">Player</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Organizer and Sponsor roles are assigned by admins.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
