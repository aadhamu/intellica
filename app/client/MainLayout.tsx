'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Check if current page is login or register
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <div className={`main-content ${isAuthPage ? '' : 'pt-5 mt-5'}`}>
      {children}
    </div>
  );
}
