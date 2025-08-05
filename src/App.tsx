import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BoardView } from '@/components/board/BoardView';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState('board-1');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          selectedBoard={selectedBoard}
          onBoardSelect={setSelectedBoard}
        />
        <main className="flex-1 overflow-hidden">
          <BoardView />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;