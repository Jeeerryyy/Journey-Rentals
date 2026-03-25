export const animateThemeToggle = (
  switchThemeFn,
  variant = 'circle',
  start = 'top-right',
  blur = false
) => {
  const styleId = 'jr-theme-transition'

  const getClipPosition = (s) => {
    const map = {
      'top-left': '0% 0%',
      'top-right': '100% 0%',
      'bottom-left': '0% 100%',
      'bottom-right': '100% 100%',
      'top-center': '50% 0%',
      'bottom-center': '50% 100%',
      center: '50% 50%',
    }
    return map[s] ?? '50% 50%'
  }

  const buildCSS = () => {
    const pos = getClipPosition(start)

    if (variant === 'rectangle') {
      const clipMap = {
        'bottom-up': { from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
        'top-down': { from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
        'left-right': { from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)', to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
        'right-left': { from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)', to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
      }
      const cp = clipMap[start] ?? clipMap['bottom-up']
      return `
        ::view-transition-group(root) { animation-duration: 0.7s; animation-timing-function: ease-out; }
        ::view-transition-new(root) { animation-name: jr-reveal; }
        ::view-transition-old(root), .dark::view-transition-old(root) { animation: none; z-index: -1; }
        .dark::view-transition-new(root) { animation-name: jr-reveal; }
        @keyframes jr-reveal {
          from { clip-path: ${cp.from}; }
          to   { clip-path: ${cp.to}; }
        }`
    }

    // circle / circle-blur
    return `
      ::view-transition-group(root) { animation-duration: 0.9s; animation-timing-function: ease-out; }
      ::view-transition-new(root) { animation-name: jr-circle-reveal; }
      ::view-transition-old(root), .dark::view-transition-old(root) { animation: none; z-index: -1; }
      .dark::view-transition-new(root) { animation-name: jr-circle-reveal; }
      @keyframes jr-circle-reveal {
        from { clip-path: circle(0% at ${pos}); ${blur ? 'filter: blur(8px);' : ''} }
        to   { clip-path: circle(150% at ${pos}); ${blur ? 'filter: blur(0px);' : ''} }
      }`
  }

  const applyStyles = () => {
    let el = document.getElementById(styleId)
    if (!el) {
      el = document.createElement('style')
      el.id = styleId
      document.head.appendChild(el)
    }
    el.textContent = buildCSS()
  }

  applyStyles()

  if (!document.startViewTransition) {
    switchThemeFn()
    return
  }
  document.startViewTransition(switchThemeFn)
}
