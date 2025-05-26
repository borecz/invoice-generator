'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Plus, Users, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { LanguageCountrySwitcher } from '@/app/components/ui/LanguageCountrySwitcher';
import LogoutButton from '@/app/component/auth/LogoutButton';

interface HeaderProps {
  user?: {
    email?: string;
  };
  showQuickActions?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  pendingCount?: number;
}

export function Header({ user, showQuickActions = false, breadcrumbs = [], pendingCount = 0 }: HeaderProps) {
  const t = useTranslations('navigation');
  const tHeader = useTranslations('header');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header
        className="bg-header border-b border-border sticky top-0 z-40 theme-transition"
        role="banner"
        aria-label="Site header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo and Breadcrumb */}
            <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
              <Link
                href={user ? "/dashboard" : "/"}
                className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                aria-label="InvoicePro home"
              >
                <Image
                  src="/android-chrome-512x512.png"
                  width={32}
                  height={32}
                  className="rounded-lg flex-shrink-0"
                  alt="InvoicePro Logo"
                />
                <span className="text-lg lg:text-xl font-bold text-header truncate">InvoicePro</span>
              </Link>
              {breadcrumbs.length > 0 && (
                <nav
                  className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground min-w-0"
                  aria-label="Breadcrumb navigation"
                >
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <span aria-hidden="true">/</span>
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 truncate"
                          aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="truncate" aria-current="page">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Quick Action Buttons */}
              {showQuickActions && user && (
                <div className="flex items-center space-x-2">
                  <Link href="/new">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      aria-label="Create new invoice"
                    >
                      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                      <span className="hidden xl:inline">{t('newInvoice')}</span>
                      <span className="xl:hidden">New</span>
                    </Button>
                  </Link>
                  <Link href="/customers">
                    <Button
                      variant="outline"
                      size="sm"
                      className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Add new customer"
                    >
                      <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                      <span className="hidden xl:inline">{t('addCustomer')}</span>
                      <span className="xl:hidden">Customer</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Language/Country Switcher */}
              <LanguageCountrySwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Notifications${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {pendingCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      aria-label={`${pendingCount} pending notifications`}
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </div>

            {/* User Menu */}
            <div className="hidden lg:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`User menu for ${user.email}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={`${user.email} avatar`} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{tHeader('account')}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        {tHeader('profileSettings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full cursor-pointer">
                        {t('dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/" className="w-full cursor-pointer">
                        {t('backToHomepage')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <LogoutButton variant="ghost" className="w-full text-left text-red-600 hover:text-red-700 justify-start" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {t('signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-border bg-header"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Language/Country Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Language & Region</span>
                <LanguageCountrySwitcher />
              </div>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>

              {/* Mobile Quick Actions */}
              {showQuickActions && user && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/new">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('newInvoice')}
                      </Button>
                    </Link>
                    <Link href="/customers">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {t('addCustomer')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile User Menu */}
              {user ? (
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={`${user.email} avatar`} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white text-sm">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{tHeader('account')}</p>
                    </div>
                    {/* Mobile Notifications */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative"
                      aria-label={`Notifications${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
                    >
                      <Bell className="h-5 w-5" />
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      href="/settings"
                      className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {tHeader('profileSettings')}
                    </Link>
                    <Link
                      href="/"
                      className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('backToHomepage')}
                    </Link>
                    <LogoutButton
                      variant="ghost"
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors justify-start"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
