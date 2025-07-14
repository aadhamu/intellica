import './globals.css';
import Script from 'next/script';
import BootstrapClient from './client/BootstrapClient';
import MainLayout from './client/MainLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
        <BootstrapClient />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          defer
        />
      </body>
    </html>
  );
}
