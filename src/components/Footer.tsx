"use client"

import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { ChurchLogo } from "./ChurchLogo"

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const links = {
    quickLinks: [
      { label: "Home", action: () => scrollToSection('hero') },
      { label: "Classes", action: () => scrollToSection('classes') },
      { label: "Instructors", action: () => scrollToSection('instructors') },
      { label: "About Platform", action: () => scrollToSection('intro') },
    ],
    platform: [
      { label: "Platform Features", action: () => scrollToSection('features') },
      { label: "Attendance System", action: () => scrollToSection('attendance') },
      { label: "Analytics & Insights", action: () => scrollToSection('analytics') },
      { label: "Awards & Certificates", action: () => scrollToSection('awards') },
    ],
    support: [
      { label: "Sign In", href: "/login" },
      { label: "Register", href: "/signup" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  }

  return (
    <footer className="bg-green-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.03),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <ChurchLogo size="md" showText={true} textClassName="text-white" />
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed max-w-sm">
              Empowering Young Single Adults to develop God-given talents through practical skill training, 
              fostering self-reliance and community service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400" />
                <a href="mailto:info@lekkigatheringplace.org" className="hover:text-amber-400 transition-colors text-sm">
                  info@lekkigatheringplace.org
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="text-sm">+234 (0) 800 000 0000</span>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-sm">Lekki Stake Center, Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-amber-400">Quick Links</h3>
            <ul className="space-y-3">
              {links.quickLinks.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={link.action}
                    className="text-slate-300 hover:text-amber-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold mb-4 text-amber-400">Platform</h3>
            <ul className="space-y-3">
              {links.platform.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={link.action}
                    className="text-slate-300 hover:text-amber-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-amber-400">Get Started</h3>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>&copy; 2026 Lekki Stake Gathering Place. All rights reserved.</p>
          <p className="text-slate-500">
            Built with faith and dedication for Young Single Adults
          </p>
        </div>
      </div>
    </footer>
  )
}
