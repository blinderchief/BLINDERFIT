import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These values are correct based on what you provided
const SUPABASE_URL = "https://gqwrxivhuugfntuqlkdz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxd3J4aXZodXVnZm50dXFsa2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDA2NzksImV4cCI6MjA1OTc3NjY3OX0.ixrPXKNNPjxUnC7lOZlFH6GwMHgQa4IlexAU5jAejuM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add the missing function that's being imported in AuthContext.tsx
export const checkSupabaseConnection = async () => {
  try {
    // Simple query to check connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Supabase connection check exception:', err);
    return false;
  }
};

// Add the missing function that's being imported in AuthContext.tsx
export const isPhoneAuthAvailable = async () => {
  try {
    // This is a simple check - in a real app, you might want to test this differently
    // For now, we'll just return true to indicate phone auth is available
    return true;
  } catch (err) {
    console.error('Phone auth check failed:', err);
    return false;
  }
};

// Function to reconnect to Supabase (useful for debugging)
export const reconnectSupabase = () => {
  console.log('Reconnecting to Supabase...');
  // The client is already created with the correct URL and key
  // This function is mainly for logging purposes
  return supabase;
};

// Add the missing testSupabaseConnection function
export const testSupabaseConnection = async () => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase test connection failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    // Try to query a table to further verify connection
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
      
    if (tableError) {
      return {
        success: false,
        error: tableError.message,
        details: tableError,
        auth: 'Connected',
        database: 'Failed'
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      auth: 'Connected',
      database: 'Connected',
      tableData
    };
  } catch (err) {
    console.error('Supabase test connection exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
};







