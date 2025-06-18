/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS processing
    tailwindcss: {},
    
    // Autoprefixer for browser compatibility
    autoprefixer: {
      // Browser support configuration
      overrideBrowserslist: [
        '>0.2%',
        'not dead',
        'not op_mini all',
        'last 2 versions',
        'iOS >= 12',
        'Safari >= 12'
      ],
      // Grid support for older browsers
      grid: 'autoplace',
      // Add prefixes for flexbox
      flexbox: 'no-2009'
    },

    // CSS Nano for production optimization (only in production)
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: [
          'default',
          {
            // Preserve calc() functions
            calc: false,
            // Don't merge longhand properties
            mergeLonghand: false,
            // Preserve CSS custom properties
            cssDeclarationSorter: false,
            // Don't remove unused CSS (let PurgeCSS/Tailwind handle it)
            discardUnused: false,
            // Preserve important comments
            discardComments: {
              removeAll: false
            }
          }
        ]
      }
    }),

    // PostCSS Import for @import statements
    'postcss-import': {},
    
    // PostCSS Nested for nested CSS syntax
    'postcss-nested': {},
    
    // PostCSS Custom Properties for CSS variables fallback
    'postcss-custom-properties': {
      preserve: true,
      importFrom: [
        // Import CSS variables from files if needed
        // './styles/variables.css'
      ]
    },

    // PostCSS Color Function for modern color functions
    'postcss-color-function': {},

    // PostCSS Media Queries for better responsive design
    'postcss-custom-media': {
      preserve: true
    }
  }
}

// Development-specific plugins
if (process.env.NODE_ENV === 'development') {
  // Add development-specific PostCSS plugins here
  config.plugins['postcss-reporter'] = {
    clearReportedMessages: true,
    throwError: false
  }
}

// Production-specific optimizations
if (process.env.NODE_ENV === 'production') {
  // PurgeCSS integration (if not using Tailwind's built-in purge)
  // config.plugins['@fullhuman/postcss-purgecss'] = {
  //   content: [
  //     './app/**/*.{js,ts,jsx,tsx}',
  //     './components/**/*.{js,ts,jsx,tsx}',
  //     './lib/**/*.{js,ts,jsx,tsx}',
  //   ],
  //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
  //   safelist: [
  //     // Add classes that should never be purged
  //     'html', 'body', /^nprogress/
  //   ]
  // }
}

module.exports = config
