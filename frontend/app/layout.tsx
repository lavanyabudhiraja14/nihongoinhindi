import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Nihongo Seekho - हिंदी में जापानी सीखें (JLPT N5)',
  description: 'हिंदी में सरल पाठों के साथ जापानी वर्णमाला, शब्दावली और N5 व्याकरण सीखें।',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="min-h-screen bg-[#F4F4F6] text-[#0D1B4B]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
