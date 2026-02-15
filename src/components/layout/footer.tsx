import Link from "next/link";
import { Zap, Linkedin, Instagram, Mail, MapPin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">IEEE</span> Student Branch
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advancing technology for the benefit of humanity. Join us in our
              mission to innovate, learn, and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/activities" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Activities
              </Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Events
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Connect With Us
            </h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a 
                href="mailto:ieeevitpune@gmail.com" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                ieeevitpune@gmail.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Vishwakarma Institute of Technology (VIT), Bibwewadi, Pune.
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/company/ieee-student-branch-vit-pune/mycompany/", label: "LinkedIn" },
                { icon: Instagram, href: "https://www.instagram.com/ieee_vit_studentbranch/", label: "Instagram" },
                { icon: Youtube, href: "https://www.youtube.com/@ieeestudentbranchvitpune6406", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:glow-box transition-all"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} IEEE Student Branch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
