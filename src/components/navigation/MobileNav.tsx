'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Bot, Sparkles, Gamepad2, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { href: '/dashboard', icon: Sparkles, label: 'Dashboard' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/bots', icon: Bot, label: 'Bots' },
    { href: '/arcade', icon: Gamepad2, label: 'Arcade' },
    { href: '/community', icon: Users, label: 'Community' },
    { 
      href: '/support', 
      icon: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ), 
      label: 'Support' 
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden" 
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-[4.5rem] left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-cyan-500/20 z-50 md:hidden">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 rounded-lg transition-all group"
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-orbitron font-medium text-base">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

