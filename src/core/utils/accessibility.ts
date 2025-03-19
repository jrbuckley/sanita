// WCAG 2.1 Color Contrast Requirements
export const WCAG_COLORS = {
  primary: {
    main: '#0066CC', // Meets AAA for large text, AA for normal text
    light: '#4D94FF',
    dark: '#004C99',
    contrast: '#FFFFFF'
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrast: '#FFFFFF'
  },
  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
    contrast: '#000000'
  },
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    contrast: '#FFFFFF'
  },
  text: {
    primary: '#000000DE', // 87% opacity black
    secondary: '#00000099', // 60% opacity black
    disabled: '#00000061' // 38% opacity black
  }
}

// Minimum touch target sizes (in pixels)
export const TOUCH_TARGET_SIZE = {
  min: 44, // iOS minimum
  recommended: 48 // Material Design / Android minimum
}

// Focus visible styles
export const FOCUS_STYLES = {
  outline: '2px solid #0066CC',
  outlineOffset: '2px'
}

// Animation durations
export const ANIMATION_DURATION = {
  short: 200,
  medium: 300,
  long: 400
}

// Screen reader only class
export const SCREEN_READER_ONLY = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0'
}

// Accessibility helper functions
export const accessibilityUtils = {
  // Generate ARIA labels
  getAriaLabel: (elementType: string, context?: string): string => {
    return `${elementType}${context ? ` for ${context}` : ''}`
  },

  // Check color contrast
  checkColorContrast: (foreground: string, background: string): boolean => {
    // This is a simplified version. In production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '')
      const rgb = parseInt(hex, 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const ratio = (Math.max(getLuminance(foreground), getLuminance(background)) + 0.05) /
                 (Math.min(getLuminance(foreground), getLuminance(background)) + 0.05)
    return ratio >= 4.5 // WCAG AA standard for normal text
  },

  // Generate unique IDs for ARIA attributes
  generateAriaId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Check if reduced motion is preferred
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Get animation duration based on reduced motion preference
  getAnimationDuration: (duration: number): number => {
    return accessibilityUtils.prefersReducedMotion() ? 0 : duration
  }
} 