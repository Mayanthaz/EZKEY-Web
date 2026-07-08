import Link from "next/link";
import {
  Gamepad2,
  Twitter,
  MessageCircle,
  Youtube,
  Shield,
  Zap,
  HeartHandshake,
} from "lucide-react";
import { FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative bg-cyber-darker border-t border-cyber-border overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-10 border-b border-cyber-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Secure Escrow</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Funds protected until delivery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Instant Delivery</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get your keys in seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Buyer Protection</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full refund guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <Gamepad2 className="w-7 h-7 text-neon-purple" />
              <span className="font-display text-lg font-bold text-gradient tracking-wider">
                EZKEY
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {SITE_CONFIG.description}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-cyber-card flex items-center justify-center
                         text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10
                         border border-cyber-border hover:border-neon-purple/30 transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-cyber-card flex items-center justify-center
                         text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/10
                         border border-cyber-border hover:border-neon-blue/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-cyber-card flex items-center justify-center
                         text-muted-foreground hover:text-red-400 hover:bg-red-400/10
                         border border-cyber-border hover:border-red-400/30 transition-all duration-300"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-neon-purple transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-neon-blue transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-neon-green transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-cyber-border gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EZKEY. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
