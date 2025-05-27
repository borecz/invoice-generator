'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
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
import { Bell, Plus, Users, Menu, X, Globe } from 'lucide-react';

// Lazy load components for performance optimization
const ThemeToggle = lazy(() =>
  import('@/app/components/ui/ThemeToggle').then(module => ({
    default: module.ThemeToggle
  }))
);
const LanguageCountrySwitcher = lazy(() =>
  import('@/app/components/ui/LanguageCountrySwitcher').then(module => ({
    default: module.LanguageCountrySwitcher
  }))
);
const LogoutButton = lazy(() => import('@/app/component/auth/LogoutButton'));

type HeaderMode = 'landing' | 'dashboard' | 'minimal';

interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  mode?: HeaderMode;
  user?: {
    email?: string;
  };
  showQuickActions?: boolean;
  showNavigation?: boolean;
  navigationItems?: NavigationItem[];
  breadcrumbs?: BreadcrumbItem[];
  pendingCount?: number;
  customActions?: React.ReactNode;
  title?: string;
  description?: string;
}

export function Header({
  mode = 'dashboard',
  user,
  showQuickActions = false,
  showNavigation = false,
  navigationItems = [],
  breadcrumbs = [],
  pendingCount = 0,
  customActions,
  title,
  description
}: HeaderProps) {
  const currentLocale = useLocale(); // Force re-render when locale changes
  const t = useTranslations('navigation');
  const tHeader = useTranslations('header');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Default navigation items for landing mode
  const defaultNavigationItems: NavigationItem[] = [
    { label: t('features'), href: '#features' },
    { label: t('pricing'), href: '#pricing' },
    { label: t('testimonials'), href: '#testimonials' }
  ];

  // Use provided navigation items or defaults based on mode
  const currentNavigationItems = navigationItems.length > 0
    ? navigationItems
    : (mode === 'landing' ? defaultNavigationItems : []);

  // Ensure re-render when locale changes
  useEffect(() => {
    // Component will re-render when currentLocale changes
    // This ensures translations update properly
  }, [currentLocale]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

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
            {/* Logo, Navigation, and Breadcrumb */}
            <div className="flex items-center space-x-3 lg:space-x-6 min-w-0 flex-1">
              <Link
                href={mode === 'landing' ? "/" : (user ? "/dashboard" : "/")}
                className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                aria-label="InvoiceAgent home"
              >
                <Image
                  src="/android-chrome-512x512.png"
                  width={32}
                  height={32}
                  className="rounded-lg flex-shrink-0"
                  alt="InvoiceAgent Logo"
                />
                <span className="text-lg lg:text-xl font-bold text-header truncate">InvoiceAgent</span>
              </Link>

              {/* Desktop Navigation */}
              {(showNavigation || mode === 'landing') && currentNavigationItems.length > 0 && (
                <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
                  {currentNavigationItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
                      {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
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
            <div className="hidden lg:flex items-center space-x-6">
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

              {/* Navigation Controls - WCAG 2.1 AA Compliant Spacing */}
              <div className="flex items-center space-x-3 sm:space-x-4" role="group" aria-label="Navigation controls">
                {/* Language/Country Switcher */}
                <div className="flex-shrink-0">
                  <Suspense fallback={<div className="w-11 h-11 animate-pulse bg-muted rounded-md" />}>
                    <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <LanguageCountrySwitcher />
                    </div>
                  </Suspense>
                </div>

                {/* Theme Toggle */}
                <div className="flex-shrink-0">
                  <Suspense fallback={<div className="w-16 h-8 animate-pulse bg-muted rounded-full" />}>
                    <div className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2">
                      <ThemeToggle />
                    </div>
                  </Suspense>
                </div>

                {/* Notifications */}
                {user && (
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative min-w-[44px] min-h-[44px] p-2 focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/50 transition-colors"
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
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-w-[44px] min-h-[44px] p-2 focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/50 transition-colors"
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
                      className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/50 transition-colors"
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
                      <Suspense fallback={<div className="w-full h-6 animate-pulse bg-muted rounded" />}>
                        <LogoutButton variant="ghost" className="w-full text-left text-red-600 hover:text-red-700 justify-start" />
                      </Suspense>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3 sm:space-x-4" role="group" aria-label="Authentication">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[44px] min-h-[44px] px-4 py-2 focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/50 transition-colors"
                      aria-label="Sign in to your account"
                    >
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="min-w-[44px] min-h-[44px] px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
                      aria-label="Create a new account"
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
              {/* Mobile Navigation */}
              {(showNavigation || mode === 'landing') && currentNavigationItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Navigation</p>
                  <div className="space-y-1">
                    {currentNavigationItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                        {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Language/Country Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Language & Region</span>
                <Suspense fallback={<div className="w-8 h-8 animate-pulse bg-muted rounded" />}>
                  <LanguageCountrySwitcher />
                </Suspense>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <Suspense fallback={<div className="w-8 h-8 animate-pulse bg-muted rounded" />}>
                  <ThemeToggle />
                </Suspense>
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
                    <Suspense fallback={<div className="w-full h-8 animate-pulse bg-muted rounded" />}>
                      <LogoutButton
                        variant="ghost"
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors justify-start"
                      />
                    </Suspense>
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
