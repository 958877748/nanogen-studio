import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nangen Studio - AI图像生成器',
  description: '使用AI生成精美图像的工作室',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          card: {
            boxShadow: '0 0 0 1px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)',
          },
        },
      }}
    >
      <html lang="zh">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}