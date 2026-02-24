import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Panel de administración',
  icons: {
    icon: '/logo-removebg-preview.png',
    apple: '/logo-removebg-preview.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}
