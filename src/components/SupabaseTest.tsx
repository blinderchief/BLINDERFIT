import { useState } from 'react';
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const runConnectionTest = async () => {
    setLoading(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setLoading(false);
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }
    
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log(`Testing reset with email: ${testEmail}`);
      console.log(`Redirect URL: ${redirectUrl}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error("Reset test error:", error);
        setTestResult({ success: false, error });
      } else {
        setTestResult({ 
          success: true, 
          message: `Password reset email sent to ${testEmail}. Check your inbox and spam folder.`,
          redirectUrl
        });
      }
    } catch (err) {
      console.error("Reset test exception:", err);
      setTestResult({ success: false, error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto my-8 border border-gold/20 bg-black/50 rounded-md">
      <h2 className="text-2xl font-semibold mb-6 text-gold">Supabase Connection Test</h2>
      
      <div className="mb-6">
        <button 
          onClick={runConnectionTest}
          disabled={loading}
          className="px-4 py-2 bg-gold text-black rounded-md mr-2"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl mb-3 text-white">Test Password Reset</h3>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter test email"
          className="w-full p-3 mb-3 border border-gold/20 bg-black text-white rounded-md"
        />
        <button 
          onClick={testPasswordReset}
          disabled={loading || !testEmail}
          className="px-4 py-2 bg-gold text-black rounded-md"
        >
          {loading ? 'Sending...' : 'Send Test Reset Email'}
        </button>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <h3 className="font-semibold mb-2 text-white">{testResult.success ? 'Success' : 'Error'}</h3>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-60 text-gray-300">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-400">
        <p>Supabase Project URL: {import.meta.env.VITE_SUPABASE_URL || 'Not available'}</p>
        <p>Current Origin: {window.location.origin}</p>
      </div>
    </div>
  );
};

export default SupabaseTest;


