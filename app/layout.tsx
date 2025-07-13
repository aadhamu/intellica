import './globals.css';
import BootstrapClient from './client/BootstrapClient'; // adjust path if needed
import Script from 'next/script';



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BootstrapClient />
       <Script
    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    defer
  />
      </body>
    </html>
  );
}
