/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileText,
  Globe,
  Receipt,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslationArrays } from '@/app/hooks/useTranslationArrays';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Header } from '@/app/components/layout/Header';
import { LanguageSuggestionBanner } from '@/app/components/ui/LanguageSuggestionBanner';

// Lazy load heavy components
const DemoPreview = lazy(() => import("./components/demoPreview"));

const Home = () => {
  const { user, loading } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Translation hooks
  const t = useTranslations('landing');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { getPricingFeatures } = useTranslationArrays();

  // Set a timeout to show the page even if auth is still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 3000); // Show page after 3 seconds regardless of auth state

    if (!loading) {
      clearTimeout(timer);
      setAuthInitialized(true);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading only for a short time, then show the page
  if (loading && !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  // Pricing data
  const pricingPlans = [
    {
      name: t('pricing.free.title'),
      price: { monthly: 0, yearly: 0 },
      description: t('pricing.free.description'),
      features: getPricingFeatures('free'),
      limitations: [],
      cta: tNav('signup'),
      popular: false
    },
    {
      name: t('pricing.pro.title'),
      price: { monthly: 19, yearly: 190 },
      description: t('pricing.pro.description'),
      features: getPricingFeatures('pro'),
      limitations: [],
      cta: t('pricing.pro.title'),
      popular: true
    },
    {
      name: t('pricing.enterprise.title'),
      price: { monthly: 49, yearly: 490 },
      description: t('pricing.enterprise.description'),
      features: getPricingFeatures('enterprise'),
      limitations: [],
      cta: t('cta.contactSales'),
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header Component */}
      <Header
        mode="landing"
        user={user}
        showNavigation={true}
      />

      {/* Facebook-inspired Language Suggestion Banner */}
      <LanguageSuggestionBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="orange" className="mb-6">
              {t('badge.trustedBy')}
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-4">
                    {t('cta.dashboard')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    {t('hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                {t('hero.watchDemo')}
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">4.9/5</span>
                <span>{t('socialProof.rating')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span><span className="font-semibold text-gray-900">50,000+</span> {t('socialProof.invoicesCreated')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Demo Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('demo.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('demo.subtitle')}
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-96 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('demo.loading')}</p>
                  </div>
                </div>
              }>
                <DemoPreview />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.invoice.title')}</h3>
              <p className="text-gray-600">{t('features.invoice.description')}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.tracking.title')}</h3>
              <p className="text-gray-600">{t('features.tracking.description')}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.customers.title')}</h3>
              <p className="text-gray-600">{t('features.customers.description')}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.reports.title')}</h3>
              <p className="text-gray-600">{t('features.reports.description')}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.automation.title')}</h3>
              <p className="text-gray-600">{t('features.automation.description')}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.integration.title')}</h3>
              <p className="text-gray-600">{t('features.integration.description')}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {t('pricing.subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                {t('pricing.monthly')}
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                {t('pricing.annually')}
              </span>
              <Badge variant="success" className="ml-2">
                {t('pricing.save')}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-orange-500 shadow-lg scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <Badge variant="orange" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {t('common.mostPopular')}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-500 ml-1">
                      /{isYearly ? t('common.year') : t('common.month')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {Array.isArray(plan.limitations) && plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-center gap-3 opacity-60">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonials.customer1.quote')}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.customer1.name')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.customer1.company')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonials.customer2.quote')}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.customer2.name')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.customer2.company')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonials.customer3.quote')}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.customer3.name')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.customer3.company')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  {t('cta.dashboard')}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  {t('cta.button')}
                </Button>
              </Link>
            )}
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-orange-500">
              {t('cta.contactSales')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/android-chrome-512x512.png"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  alt="InvoicePro Logo"
                />
                <span className="text-xl font-bold">InvoicePro</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/ThatsPranav" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/pranavp10/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://github.com/pranavp10/invoice-generator" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.product')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.templates')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.integrations')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.documentation')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.termsOfService')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
