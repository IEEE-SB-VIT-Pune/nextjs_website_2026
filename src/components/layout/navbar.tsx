"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ScrambleHover from "@/components/ui/scramble-hover";
import ieeeLogo from "@/assets/images/footer/IEEE_logo2.png";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
}

const baseLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Activities", path: "/activities" },
  { label: "Events", path: "/events" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Poll profile details on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    checkAuth();
  }, [pathname]); // Refresh on navigation changes

  // Compute dynamic navigation links
  const navLinks = [...baseLinks];
  if (user) {
    if (user.role === "ADMIN") {
      navLinks.push({ label: "CMS Admin", path: "/dashboard" });
    } else {
      navLinks.push({ label: "Recruitment", path: "/recruitment" });
      navLinks.push({ label: "Profile", path: "/profile" });
    }
    navLinks.push({ label: "Logout", path: "#logout" });
  } else {
    navLinks.push({ label: "Sign In", path: "/login" });
  }

  const handleLinkClick = async (path: string, e: React.MouseEvent) => {
    if (path === "#logout") {
      e.preventDefault();
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setUser(null);
          router.push("/login");
          router.refresh();
        }
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="w-full flex h-16 items-center justify-start px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center gap-2">
            <div className="h-14 w-14 rounded-lg bg-card/60 p-1">
              <Image
                src={ieeeLogo}
                alt="IEEE logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">
            <span className="text-foreground">Student Branch</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {navLinks.map((link) => {
            const isLogout = link.path === "#logout";
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(link.path, e)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary"
                    : isLogout
                    ? "text-destructive hover:text-destructive/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ScrambleHover
                  text={link.label}
                  scrambleSpeed={40}
                  sequential={true}
                  revealDirection="start"
                  useOriginalCharsOnly={false}
                  characters="abcdefghijklmnopqrstuvwxyz"
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20 pointer-events-none"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isLogout = link.path === "#logout";
                const isActive = pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={(e) => handleLinkClick(link.path, e)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : isLogout
                        ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
