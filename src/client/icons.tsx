import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function TranslationIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M4.5 5.5h9.25a2 2 0 0 1 2 2v4.25a2 2 0 0 1-2 2H9l-3.5 2.5v-2.5h-1a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="M14.5 10.8c2.7 0 4.75 1.75 4.75 4.2s-2.05 4.2-4.75 4.2h-.6L11.6 21v-2.02a4.3 4.3 0 0 1-1.55-1.6" />
      <path d="m6.1 8.1 2.3 5.5M5.25 11.8h4.3" />
    </Icon>
  )
}

export function SwapIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M7 7h10.5l-2.7-2.7M17 17H6.5l2.7 2.7" />
    </Icon>
  )
}

export function CopyIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <rect x="8" y="8" width="10.5" height="10.5" rx="2" />
      <path d="M15.5 8V6.5a2 2 0 0 0-2-2H6.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2H8" />
    </Icon>
  )
}

export function CheckIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="m5 12.5 4.1 4L19 6.8" />
    </Icon>
  )
}

export function TrashIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M4.5 7h15M9 7V4.8h6V7M6.8 7l.8 12h8.8l.8-12M10 10.5v5M14 10.5v5" />
    </Icon>
  )
}

export function ClearIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </Icon>
  )
}

export function HistoryIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M4.3 10A8 8 0 1 1 5 15.4M4.3 5.6V10h4.4" />
      <path d="M12 7.5V12l3 1.8" />
    </Icon>
  )
}

export function SparkIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M12 3.5c.5 4.5 2 6 6.5 6.5-4.5.5-6 2-6.5 6.5-.5-4.5-2-6-6.5-6.5 4.5-.5 6-2 6.5-6.5Z" />
      <path d="M18.5 16.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z" />
    </Icon>
  )
}

export function ShieldIcon({ size = 16, ...props }: IconProps) {
  return (
    <Icon size={size} {...props}>
      <path d="M12 3.5 19 6v5.2c0 4.2-2.8 7.4-7 9.3-4.2-1.9-7-5.1-7-9.3V6l7-2.5Z" />
      <path d="m9.1 12 1.8 1.8 4-4.1" />
    </Icon>
  )
}
