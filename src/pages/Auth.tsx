import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { Badge } from "@/components/ui/badge";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
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
  "Algeria", "Angola", "Argentina", "Australia", "Austria", "Belgium", "Benin",
  "Botswana", "Brazil", "Burkina Faso", "Burundi", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Côte d'Ivoire", "Czech Republic", "Democratic Republic of the Congo",
  "Denmark", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini",
  "Ethiopia", "Finland", "France", "Gabon", "Gambia", "Germany", "Ghana", "Greece",
  "Guinea", "Guinea-Bissau", "Hong Kong", "Hungary", "India", "Indonesia", "Ireland",
  "Israel", "Italy", "Japan", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar",
  "Malawi", "Malaysia", "Mali", "Mauritania", "Mauritius", "Mexico", "Morocco",
  "Mozambique", "Namibia", "Netherlands", "New Zealand", "Niger", "Nigeria", "Norway",
  "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia",
  "Rwanda", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sudan", "Sweden",
  "Switzerland", "Taiwan", "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Vietnam", "Zambia", "Zimbabwe"
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
  const { t } = useTranslation();
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
            toast.error(t('auth.emailRegistered'));
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success(t('auth.accountCreated'));
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
            toast.error(t('auth.invalidCredentials'));
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success(t('auth.welcomeBack'));
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(t('auth.unexpectedError'));
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
        <span className="font-display text-sm uppercase tracking-wider">{t('auth.backToHome')}</span>
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
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 font-display text-sm uppercase tracking-wider rounded-sm border transition-all ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {t('auth.signUp')}
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
                      placeholder={t('auth.usernamePlaceholder')}
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
                        <SelectValue placeholder={t('auth.selectCountry')} />
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
                  placeholder={t('auth.email')}
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
                  placeholder={t('auth.password')}
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
                <PasswordStrengthIndicator password={password} />
              )}
            </div>

            {mode === "signup" && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.confirmPassword')}
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
                  {mode === "signup" ? t('auth.creatingAccount') : t('auth.signingIn')}
                </>
              ) : mode === "signup" ? (
                t('auth.createAccount')
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          {/* Role Info */}
          {mode === "signup" && (
            <div className="mt-6 p-4 rounded-sm bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {t('auth.newAccountInfo')} <Badge variant="default" size="sm">{t('common.player')}</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                {t('auth.roleAssignment')}
              </p>
            </div>
          )}

          {/* Quick Access - Test Accounts */}
          {mode === "signin" && (
            <div className="mt-6 p-4 rounded-sm bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground mb-3 font-display uppercase tracking-wider">
                {t('auth.quickAccess')}
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@riftarena.com");
                    setPassword("RiftManager2024!");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-sm bg-background/50 border border-border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" size="sm">Admin</Badge>
                    <span className="text-xs text-muted-foreground">admin@riftarena.com</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("organizer@riftarena.com");
                    setPassword("RiftManager2024!");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-sm bg-background/50 border border-border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">Organizer</Badge>
                    <span className="text-xs text-muted-foreground">organizer@riftarena.com</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("sponsor@riftarena.com");
                    setPassword("RiftManager2024!");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-sm bg-background/50 border border-border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">Sponsor</Badge>
                    <span className="text-xs text-muted-foreground">sponsor@riftarena.com</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
