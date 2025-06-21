import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '../components/context/AppContext'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Recruiting Dashboard - Gestione Candidati',
  description: 'Dashboard professionale per la gestione di candidati e processo di recruiting. Sviluppata con Next.js, Supabase e TailwindCSS.',
  keywords: ['recruiting', 'dashboard', 'candidati', 'HR', 'gestione risorse umane'],
  authors: [{ name: 'Recruiting Team' }],
  creator: 'Recruiting Dashboard',
  publisher: 'Recruiting Dashboard',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://recruiting-dashboard.vercel.app'),
  openGraph: {
    title: 'Recruiting Dashboard - Gestione Candidati',
    description: 'Dashboard professionale per la gestione di candidati e processo di recruiting.',
    url: 'https://recruiting-dashboard.vercel.app',
    siteName: 'Recruiting Dashboard',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Recruiting Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiting Dashboard - Gestione Candidati',
    description: 'Dashboard professionale per la gestione di candidati e processo di recruiting.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
  category: 'business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={inter.variable}>
      <head>
        {/* ...tutto il tuo head invariato... */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme') || 'light';
                  if (mode === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* <script defer src="/_vercel/insights/script.js"></script> */}
      </head>
      <body 
        className={`
          ${inter.className} 
          font-sans 
          antialiased 
          bg-secondary-50 
          text-secondary-900
          min-h-screen
          overflow-x-hidden
        `}
        suppressHydrationWarning={true}
      >
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          Vai al contenuto principale
        </a>
        <AppProvider>
          {/* Main application */}
          <div id="app" className="relative min-h-screen">
            {/* Background pattern for modern look */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-primary-400/20 to-purple-400/20 blur-3xl" />
              <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-success-400/20 to-primary-400/20 blur-3xl" />
            </div>
            {/* App content */}
            <main id="main-content" className="relative z-10">
              {children}
            </main>
          </div>
          {/* Toast notifications container */}
          <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
          {/* Modal container */}
          <div id="modal-container" />
          {/* Loading indicator for page transitions */}
          <div 
            id="page-loading" 
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary-500 transform scale-x-0 transition-transform duration-300 origin-left"
            style={{ display: 'none' }}
          />
        </AppProvider>
        {/* ...tutte le style tag e script rimangono come nel tuo file... */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* ...tutte le tue global style... */
          `
        }} />
      </body>
    </html>
  )
}
