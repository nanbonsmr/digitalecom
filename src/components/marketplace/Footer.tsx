import { forwardRef } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import zyrobayLogo from "@/assets/zyrobay-logo.png";

const footerLinks = {
  categories: [
    { label: "Business Templates", href: "#" },
    { label: "Design Assets", href: "#" },
    { label: "Ebooks & Guides", href: "#" },
    { label: "UI Kits", href: "#" },
    { label: "Resume Templates", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Report an Issue", href: "#" },
    { label: "Community", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Partners", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "License", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="dark-gradient text-muted-foreground">
      <div className="container py-10 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10">
          {/* Brand & Newsletter */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center mb-4">
              <img src={zyrobayLogo} alt="ZyroBay" className="h-10" />
            </a>
            <p className="text-sm mb-6 text-muted-foreground/80">
              The ultimate marketplace for premium digital products. Download templates, ebooks, design assets, and more.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Subscribe to our newsletter</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
                <Button className="btn-gradient-primary shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Categories</h4>
            <ul className="space-y-2 md:space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs md:text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Support</h4>
            <ul className="space-y-2 md:space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs md:text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 md:space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs md:text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold text-white mb-3 md:mb-4 text-sm md:text-base">Legal</h4>
            <ul className="space-y-2 md:space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs md:text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-muted-foreground/70 text-center sm:text-left">
            © {new Date().getFullYear()} ZyroBay. All rights reserved.
          </p>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
            <span className="text-muted-foreground/70 hidden sm:inline">Accepted Payments:</span>
            <div className="flex items-center gap-2">
              <div className="h-5 md:h-6 px-2 bg-white/10 rounded flex items-center justify-center text-[10px] md:text-xs font-medium text-white">VISA</div>
              <div className="h-5 md:h-6 px-2 bg-white/10 rounded flex items-center justify-center text-[10px] md:text-xs font-medium text-white">MC</div>
              <div className="h-5 md:h-6 px-2 bg-white/10 rounded flex items-center justify-center text-[10px] md:text-xs font-medium text-white">PayPal</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
