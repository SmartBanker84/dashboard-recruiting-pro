import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
  verification: {
    // Add your verification codes here if needed
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
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
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href="//supabase.co" />
        
        {/* Prevent FOUC (Flash of Unstyled Content) */}
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
        
        {/* Performance monitoring (uncomment if using services like Vercel Analytics) */}
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
        
        {/* Service worker registration for PWA capabilities */}
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
        
        {/* Error boundary fallback styling */}
        <style jsx>{`
          .error-boundary {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 2rem;
            text-align: center;
          }
          
          .error-boundary h1 {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
          }
          
          .error-boundary p {
            color: #6b7280;
            margin-bottom: 2rem;
            max-width: 500px;
          }
          
          .error-boundary button {
            background-color: #0ea5e9;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            border: none;
            cursor: pointer;
            font-weight: 500;
          }
          
          .error-boundary button:hover {
            background-color: #0284c7;
          }
        `}</style>
        
        {/* Global styles for consistent scrollbars */}
        <style jsx global>{`
          /* Custom scrollbar styles */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          /* Focus styles for accessibility */
          .focus-visible {
            outline: 2px solid #0ea5e9;
            outline-offset: 2px;
          }
          
          /* Remove default button focus styles */
          button:focus {
            outline: none;
          }
          
          button:focus-visible {
            outline: 2px solid #0ea5e9;
            outline-offset: 2px;
          }
          
          /* Smooth transitions for interactive elements */
          button, a, input, select, textarea {
            transition: all 0.2s ease-in-out;
          }
          
          /* Loading state for images */
          img {
            transition: opacity 0.3s ease-in-out;
          }
          
          img[data-loading="true"] {
            opacity: 0.5;
          }
          
          /* Print styles */
          @media print {
            .no-print {
              display: none !important;
            }
            
            .print-break {
              page-break-before: always;
            }
            
            body {
              background: white !important;
              color: black !important;
            }
          }
          
          /* Motion preferences */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* High contrast mode */
          @media (prefers-contrast: high) {
            .shadow-soft {
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}
