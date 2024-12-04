import React from 'react';
import { AuthProvider } from './components/AuthProvider';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { DynamicSchemaManager } from './components/DynamicSchemaManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Workers Comp Admin</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DynamicSchemaManager />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            success: {
              className: '!bg-green-50 !text-green-900 !border !border-green-200',
              iconTheme: { primary: '#22c55e', secondary: '#fff' }
            },
            error: {
              className: '!bg-red-50 !text-red-900 !border !border-red-200',
              iconTheme: { primary: '#ef4444', secondary: '#fff' }
            }
          }}
        />
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}