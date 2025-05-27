"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * BULLETPROOF DEBUG DASHBOARD
 * This is a minimal, guaranteed-to-work version that will help us identify the issue
 */
const DebugDashboard = () => {
  const { user, loading, error } = useAuth();
  const currentLocale = useLocale();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [renderCount, setRenderCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Safe translations with fallbacks
  let t: any, tNav: any, tCommon: any;
  try {
    t = useTranslations('dashboard');
    tNav = useTranslations('navigation');
    tCommon = useTranslations('common');
  } catch (err) {
    console.error('Translation error:', err);
    // Fallback translations
    t = (key: string) => key;
    tNav = (key: string) => key;
    tCommon = (key: string) => key;
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    console.log('Debug Dashboard:', logEntry);
    setDebugLog(prev => [...prev.slice(-15), logEntry]);
  };

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    addLog(`Render #${renderCount + 1} - Locale: ${currentLocale}`);
  });

  // Mount tracking
  useEffect(() => {
    addLog('Component mounting');
    setMounted(true);
    
    // Force resolution after 5 seconds if still loading
    const forceTimeout = setTimeout(() => {
      if (loading) {
        addLog('FORCE TIMEOUT: Still loading after 5 seconds');
      }
    }, 5000);

    return () => {
      addLog('Component unmounting');
      clearTimeout(forceTimeout);
    };
  }, []);

  // Auth state tracking
  useEffect(() => {
    addLog(`Auth state: loading=${loading}, user=${user ? 'present' : 'null'}, error=${error ? error.message : 'none'}`);
  }, [loading, user, error]);

  // Locale tracking
  useEffect(() => {
    addLog(`Locale changed: ${currentLocale}`);
  }, [currentLocale]);

  const currentTime = new Date().toISOString();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">
              🔧 DEBUG DASHBOARD - WORKING
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Time:</strong><br />
                {currentTime}
              </div>
              <div>
                <strong>Locale:</strong><br />
                {currentLocale}
              </div>
              <div>
                <strong>Renders:</strong><br />
                {renderCount}
              </div>
              <div>
                <strong>Mounted:</strong><br />
                {mounted ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                <span>Loading: {loading ? 'TRUE' : 'FALSE'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>User: {user ? `✅ ${user.email}` : '❌ Not authenticated'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
                <span>Error: {error ? `❌ ${error.message}` : '✅ None'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/auth/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Go to Homepage</Button>
            </Link>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>

        {/* Debug Log */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Log (Last 15 entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
              {debugLog.length === 0 ? (
                <div>No debug entries yet...</div>
              ) : (
                debugLog.map((entry, index) => (
                  <div key={index}>{entry}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Translation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Translation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>Dashboard welcome: {typeof t === 'function' ? t('welcome') : 'Translation function not available'}</div>
              <div>Navigation dashboard: {typeof tNav === 'function' ? tNav('dashboard') : 'Translation function not available'}</div>
              <div>Common loading: {typeof tCommon === 'function' ? tCommon('loading') : 'Translation function not available'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugDashboard;
