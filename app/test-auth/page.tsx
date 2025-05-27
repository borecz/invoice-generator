"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Testing Supabase connection...');
      
      // Test 1: Check environment variables
      addResult(`📋 NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`);
      addResult(`📋 NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`);
      
      // Test 2: Try to get current user (should work even if no user is logged in)
      addResult('🔐 Testing auth.getUser()...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        if (userError.message === 'Auth session missing!') {
          addResult('✅ Auth connection working (no user logged in - this is normal)');
        } else {
          addResult(`❌ Auth error: ${userError.message}`);
        }
      } else {
        addResult(`✅ Auth working. User: ${userData.user ? 'Logged in' : 'Not logged in'}`);
      }
      
      // Test 3: Try to get session
      addResult('🔐 Testing auth.getSession()...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult(`✅ Session check working. Session: ${sessionData.session ? 'Active' : 'None'}`);
      }
      
      // Test 4: Test a simple database query (should fail with auth error if not logged in)
      addResult('🗄️ Testing database connection...');
      const { data: dbData, error: dbError } = await supabase
        .from('invoices')
        .select('count')
        .limit(1);
      
      if (dbError) {
        if (dbError.message.includes('JWT')) {
          addResult('✅ Database connection working (auth required - this is normal)');
        } else {
          addResult(`❌ Database error: ${dbError.message}`);
        }
      } else {
        addResult('✅ Database connection working');
      }
      
      addResult('🎉 Connection test completed!');
      
    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    addResult('🔐 Testing login with test credentials...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (error) {
        addResult(`❌ Login error: ${error.message}`);
      } else {
        addResult('✅ Login successful!');
        addResult(`User: ${data.user?.email}`);
      }
    } catch (error: any) {
      addResult(`❌ Login exception: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Authentication Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testSupabaseConnection} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Testing...' : 'Test Supabase Connection'}
              </Button>
              
              <Button 
                onClick={testLogin} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Testing...' : 'Test Login'}
              </Button>
            </div>
            
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index}>{result}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Test Supabase Connection" to verify the basic setup</li>
                <li>Check the results for any connection issues</li>
                <li>If connection works, the login issue is likely in the form handling</li>
                <li>If connection fails, check environment variables and Supabase project settings</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
