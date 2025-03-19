import React from 'react'
import { FOCUS_STYLES, TOUCH_TARGET_SIZE, accessibilityUtils } from '../../utils/accessibility'

interface AccessibleComponentProps {
  id?: string
  className?: string
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaControls?: string
  ariaExpanded?: boolean
  ariaHidden?: boolean
  ariaSelected?: boolean
  tabIndex?: number
  children?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

export const AccessibleComponent: React.FC<AccessibleComponentProps> = ({
  id,
  className = '',
  role,
  ariaLabel,
  ariaDescribedBy,
  ariaControls,
  ariaExpanded,
  ariaHidden,
  ariaSelected,
  tabIndex,
  children,
  onClick,
  onKeyDown,
}) => {
  // Generate a unique ID if none provided
  const componentId = id || accessibilityUtils.generateAriaId('component')

  // Handle keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(event)
      return
    }

    // Default keyboard handling for interactive elements
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(event as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <div
      id={componentId}
      className={`accessible-component ${className}`}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-hidden={ariaHidden}
      aria-selected={ariaSelected}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        minWidth: onClick ? TOUCH_TARGET_SIZE.recommended : undefined,
        minHeight: onClick ? TOUCH_TARGET_SIZE.recommended : undefined,
        ...FOCUS_STYLES,
      }}
    >
      {children}
    </div>
  )
}

// Higher-order component to add accessibility features to any component
export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & AccessibleComponentProps> {
  return function WithAccessibilityComponent(props: P & AccessibleComponentProps) {
    const {
      id,
      className,
      role,
      ariaLabel,
      ariaDescribedBy,
      ariaControls,
      ariaExpanded,
      ariaHidden,
      ariaSelected,
      tabIndex,
      onClick,
      onKeyDown,
      ...componentProps
    } = props

    return (
      <AccessibleComponent
        id={id}
        className={className}
        role={role}
        ariaLabel={ariaLabel}
        ariaDescribedBy={ariaDescribedBy}
        ariaControls={ariaControls}
        ariaExpanded={ariaExpanded}
        ariaHidden={ariaHidden}
        ariaSelected={ariaSelected}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <WrappedComponent {...(componentProps as P)} />
      </AccessibleComponent>
    )
  }
} 