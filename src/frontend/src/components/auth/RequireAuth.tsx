import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-muted-foreground">Please sign in to continue</p>
          <Button onClick={login} disabled={isLoggingIn}>
            <LogIn className="mr-2 h-4 w-4" />
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
