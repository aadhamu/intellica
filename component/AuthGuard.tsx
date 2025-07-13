// components/AuthGuard.tsx (Updated)
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = !!localStorage.getItem('token');
      const isAuthRoute = pathname === '/login' ;

      if (!isAuthenticated && !isAuthRoute) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }

      
      if (isAuthenticated && isAuthRoute) {
        router.push('/user/home'); // Or your default authenticated route
      }
    };

    checkAuth();
  }, [router, pathname]);

  return <>{children}</>;
}