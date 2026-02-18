import { Link, useNavigate } from '@tanstack/react-router';
import { Home, Search, PlusSquare, User, LogOut, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import Logo from '../branding/Logo';
import { SiX } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/compose">
                    <PlusSquare className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate({ to: `/u/${identity.getPrincipal().toString()}` })}
                >
                  <User className="h-5 w-5" />
                </Button>
              </>
            )}
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={login} disabled={isLoggingIn}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoggingIn ? 'Signing in...' : 'Sign in'}
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="container py-6">{children}</main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PhotoStream. Built with{' '}
            <span className="text-destructive">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'photostream'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
