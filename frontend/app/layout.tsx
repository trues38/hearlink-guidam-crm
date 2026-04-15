import type { Metadata } from 'next'
import Sidebar from './components/Sidebar'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Hearlink CRM',
  description: '히어링크 고객 관리 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-300/30 dark:selection:bg-indigo-900/40 transition-colors duration-500">
        <Script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" strategy="afterInteractive" />
        {/* 🌟 THE KICK: Global Spectacular Ambient Mesh Gradient Background */}
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-white/50 dark:bg-slate-950/80 transition-colors duration-700">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[70vh] rounded-full bg-gradient-to-br from-indigo-400/20 dark:from-indigo-600/20 via-purple-400/10 dark:via-purple-800/15 to-transparent blur-[120px] animate-pulse-slow"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[80vh] rounded-full bg-gradient-to-bl from-blue-400/20 dark:from-blue-600/20 via-cyan-300/10 dark:via-cyan-800/15 to-transparent blur-[140px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vh] rounded-full bg-gradient-to-tr from-emerald-400/10 dark:from-teal-600/15 to-transparent blur-[120px] animate-pulse-slow" style={{ animationDelay: '5s' }}></div>
          
          {/* Subtle grid pattern for texture */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-30 dark:opacity-50 transition-all duration-700"></div>
        </div>

        <div className="flex">
          <div className="relative z-50">
            <Sidebar />
          </div>
          <main className="flex-1 min-h-screen p-4 pt-20 md:ml-64 md:p-8 relative z-0 max-w-[100vw]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
