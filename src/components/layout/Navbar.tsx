import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Shield, Users, Trophy, DollarSign, BarChart3, ChevronDown, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isLoading, isAdmin } = useAuth();

  const navLinks = [
    { href: "/tournaments", label: t("nav.tournaments") },
    { href: "/rankings", label: t("nav.rankings") },
    { href: "/games", label: t("nav.games") },
    { href: "/teams", label: t("nav.teams") },
    { href: "/sponsors", label: t("nav.sponsors") },
  ];

  const adminMenuItems = [
    { href: "/admin/users", label: t("nav.userManagement"), icon: Users, description: t("nav.userManagementDesc") },
    { href: "/admin/games", label: t("nav.gameManagement"), icon: Gamepad2, description: t("nav.gameManagementDesc") },
    { href: "/admin/sponsors", label: t("nav.sponsorManagement"), icon: DollarSign, description: t("nav.sponsorManagementDesc") },
    { href: "/admin/analytics", label: t("nav.platformAnalytics"), icon: BarChart3, description: t("nav.platformAnalyticsDesc") },
    { href: "/tournaments", label: t("nav.allTournaments"), icon: Trophy, description: t("nav.allTournamentsDesc") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <RiftLogo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "font-display text-sm uppercase tracking-wider transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          {!isLoading && (
            <>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Shield className="h-4 w-4" />
                      {t("nav.admin")}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-destructive" />
                      {t("nav.adminPanel")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminMenuItems.map((item) => (
                      <DropdownMenuItem 
                        key={item.href} 
                        onClick={() => navigate(item.href)}
                        className="cursor-pointer"
                      >
                        <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {user ? (
                <Link to="/dashboard">
                  <Button variant="rift" className="gap-2">
                    <User className="h-4 w-4" />
                    {profile?.username || "Dashboard"}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">{t("nav.signIn")}</Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="rift">{t("nav.joinRift")}</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <nav className="container flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "py-3 font-display text-sm uppercase tracking-wider transition-colors hover:text-primary border-b border-border",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                {isAdmin && (
                  <div className="border-b border-border pb-3 mb-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <Shield className="h-3 w-3 text-destructive" />
                      {t("nav.adminPanel")}
                    </p>
                    {adminMenuItems.map((item) => (
                      <Link 
                        key={item.href} 
                        to={item.href} 
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="rift" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      {profile?.username || "Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="rift-outline" className="w-full">{t("nav.signIn")}</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="rift" className="w-full">{t("nav.joinRift")}</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
