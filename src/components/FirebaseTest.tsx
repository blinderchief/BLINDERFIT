import { useState, useEffect } from 'react';
import { testFirebaseConnection } from '../integrations/firebase/client';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../integrations/firebase/client';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const FirebaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    success: false,
    message: 'Testing connection...',
    loading: true
  });
  const [authStatus, setAuthStatus] = useState({
    success: false,
    message: 'Not tested',
    loading: false
  });
  const [dbStatus, setDbStatus] = useState({
    success: false,
    message: 'Not tested',
    loading: false
  });
  const [storageStatus, setStorageStatus] = useState({
    success: false,
    message: 'Not tested',
    loading: false
  });

  // Test Firebase connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testFirebaseConnection();
        setConnectionStatus({
          success: result.success,
          message: result.message,
          loading: false
        });
      } catch (error) {
        setConnectionStatus({
          success: false,
          message: `Error: ${error}`,
          loading: false
        });
      }
    };

    checkConnection();
  }, []);

  // Test Firebase Auth
  const testAuth = async () => {
    setAuthStatus({
      success: false,
      message: 'Testing authentication...',
      loading: true
    });
    
    try {
      const auth = getAuth();
      const result = await signInAnonymously(auth);
      
      setAuthStatus({
        success: true,
        message: `Authentication successful. UID: ${result.user.uid}`,
        loading: false
      });
    } catch (error: any) {
      setAuthStatus({
        success: false,
        message: `Authentication failed: ${error.message}`,
        loading: false
      });
    }
  };

  // Test Firebase Firestore
  const testDatabase = async () => {
    setDbStatus({
      success: false,
      message: 'Testing database...',
      loading: true
    });
    
    try {
      // Write test data
      const testDocRef = doc(db, 'test', 'test-doc');
      await setDoc(testDocRef, {
        test: true,
        timestamp: serverTimestamp()
      });
      
      // Read test data
      const docSnap = await getDoc(testDocRef);
      
      if (docSnap.exists()) {
        setDbStatus({
          success: true,
          message: 'Database read/write successful',
          loading: false
        });
      } else {
        setDbStatus({
          success: false,
          message: 'Database write succeeded but read failed',
          loading: false
        });
      }
    } catch (error: any) {
      setDbStatus({
        success: false,
        message: `Database test failed: ${error.message}`,
        loading: false
      });
    }
  };

  // Test Firebase Storage
  const testStorage = async () => {
    setStorageStatus({
      success: false,
      message: 'Testing storage...',
      loading: true
    });
    
    try {
      // Create a test file
      const testData = 'Test data ' + new Date().toISOString();
      const storageRef = ref(storage, 'test/test-file.txt');
      
      // Upload test data
      await uploadString(storageRef, testData);
      
      // Get download URL to verify upload
      const downloadURL = await getDownloadURL(storageRef);
      
      setStorageStatus({
        success: true,
        message: `Storage test successful. File URL: ${downloadURL}`,
        loading: false
      });
    } catch (error: any) {
      setStorageStatus({
        success: false,
        message: `Storage test failed: ${error.message}`,
        loading: false
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Integration Test (Test Mode)</h1>
      
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
        <p className="font-semibold">⚠️ Test Mode Active</p>
        <p>Firebase is configured in test mode with open security rules. This is suitable for development but not for production.</p>
      </div>
      
      {/* Connection Status */}
      <div className={`p-4 rounded-md mb-6 ${
        connectionStatus.loading
          ? 'bg-gray-100 text-gray-700'
          : connectionStatus.success
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p>{connectionStatus.loading ? 'Testing connection...' : connectionStatus.message}</p>
      </div>
      
      {/* Auth Test */}
      <div className={`p-4 rounded-md mb-6 ${
        authStatus.loading
          ? 'bg-gray-100 text-gray-700'
          : authStatus.success
            ? 'bg-green-100 text-green-700'
            : authStatus.message === 'Not tested'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Authentication Test</h2>
        <p className="mb-2">{authStatus.loading ? 'Testing authentication...' : authStatus.message}</p>
        <button 
          onClick={testAuth}
          disabled={authStatus.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {authStatus.loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>
      
      {/* Database Test */}
      <div className={`p-4 rounded-md mb-6 ${
        dbStatus.loading
          ? 'bg-gray-100 text-gray-700'
          : dbStatus.success
            ? 'bg-green-100 text-green-700'
            : dbStatus.message === 'Not tested'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Database Test</h2>
        <p className="mb-2">{dbStatus.loading ? 'Testing database...' : dbStatus.message}</p>
        <button 
          onClick={testDatabase}
          disabled={dbStatus.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {dbStatus.loading ? 'Testing...' : 'Test Database'}
        </button>
      </div>
      
      {/* Storage Test */}
      <div className={`p-4 rounded-md mb-6 ${
        storageStatus.loading
          ? 'bg-gray-100 text-gray-700'
          : storageStatus.success
            ? 'bg-green-100 text-green-700'
            : storageStatus.message === 'Not tested'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
      }`}>
        <h2 className="text-lg font-semibold mb-2">Storage Test</h2>
        <p className="mb-2">{storageStatus.loading ? 'Testing storage...' : storageStatus.message}</p>
        <button 
          onClick={testStorage}
          disabled={storageStatus.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {storageStatus.loading ? 'Testing...' : 'Test Storage'}
        </button>
      </div>
      
      {/* Firebase Configuration */}
      <div className="bg-black/5 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Firebase Configuration</h2>
        <p className="mb-2">Your Firebase project is configured with the following details:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Project ID: <code className="bg-gray-200 px-1 py-0.5 rounded">blinderfit</code></li>
          <li>Auth Domain: <code className="bg-gray-200 px-1 py-0.5 rounded">blinderfit.firebaseapp.com</code></li>
          <li>Storage Bucket: <code className="bg-gray-200 px-1 py-0.5 rounded">blinderfit.appspot.com</code></li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;

