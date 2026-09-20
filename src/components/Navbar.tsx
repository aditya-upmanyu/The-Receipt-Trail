/**
 * Navbar Component
 * Responsive navigation with mobile menu support and Life Recap action
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen, Network, Calendar, Sparkles, Menu, X } from "lucide-react";

interface NavbarProps {
  onOpenRecap?: () => void;
}

export function Navbar({ onOpenRecap }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/timeline", label: "Timeline", icon: Calendar },
    { path: "/story", label: "Story", icon: BookOpen },
    { path: "/connections", label: "Connections", icon: Network },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-[#E8F1FF] hover:text-cyan-400 transition-colors"
            aria-label="Go to home"
          >
            <Home className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <span className="font-bold tracking-tight hidden sm:inline">YOUR LIFE, IN RECEIPTS</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navigation.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                    : "text-[#94A3B8] hover:text-[#E8F1FF] hover:bg-[#0D111A]"
                }`}
                aria-current={isActive(path) ? "page" : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}

            {onOpenRecap && (
              <button
                type="button"
                onClick={onOpenRecap}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all"
                aria-label="Open Life Recap"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recap</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#94A3B8] hover:text-[#E8F1FF] rounded-lg"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[#2e303a]" role="navigation" aria-label="Mobile navigation">
            {navigation.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? "bg-cyan-500/20 text-cyan-400 font-semibold"
                    : "text-[#94A3B8] hover:text-[#E8F1FF] hover:bg-[#0D111A]"
                }`}
                aria-current={isActive(path) ? "page" : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}

            {onOpenRecap && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRecap();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Open Life Recap</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
