/** Shared Tailwind config for every page in project/.
 *  Each page compiles its own CSS bundle (see src/tailwind/*.css) so that
 *  page-specific component classes never collide with one another, but they
 *  all draw from this single, canonical design-token source. */
module.exports = {
  // search.js builds a few result-row classes (.ns-item, .ns-group, etc.) at
  // runtime via innerHTML rather than writing them literally in any .html
  // file, so the content scanner needs the JS glob too or it purges them.
  content: ['./project/**/*.html', './project/**/*.js'],
  corePlugins: {
    // Every page already ships its own complete reset (box-sizing, margin,
    // heading sizes, svg display, etc.) that the whole design was built
    // against. Preflight's reset disagrees with it in a few places (e.g.
    // line-height:1.5, svg{display:block}) which reflows text height
    // sitewide, so it stays off and the page's own reset (still present,
    // now inside @layer components) does the job instead.
    preflight: false,
  },
  theme: {
    screens: {
      'max-960': { max: '960px' },
      'max-760': { max: '760px' },
      'max-640': { max: '640px' },
      'max-600': { max: '600px' },
    },
    extend: {
      colors: {
        black: '#000',
        white: '#fff',
        green: '#26AE68',
        bg: '#f5f5f5',
        mint: '#E6EBE3',
        muted: 'rgba(0,0,0,.4)',
        card: '#fff',
      },
      fontFamily: {
        sans: ['"Google Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        flex: ['"Google Sans Flex"', '"Google Sans"', 'sans-serif'],
      },
      borderRadius: {
        pill: '99px',
        card: '12px',
      },
      spacing: {
        px24: 'clamp(24px,10.83vw,208px)',
        py160: 'clamp(64px,8.33vw,160px)',
      },
      maxWidth: {
        mw: '1504px',
      },
      height: {
        'btn-h': '48px',
      },
      width: {
        'btn-h': '48px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [],
};
