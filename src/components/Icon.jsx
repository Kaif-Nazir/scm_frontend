function BaseIcon({ children, className = '', viewBox = '0 0 24 24', title = '', ...rest }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

function Icon({ name, className = '' }) {
  switch (name) {
    case 'xmark':
      return (
        <BaseIcon className={className}>
          <path d="M18 6 6 18M6 6l12 12" />
        </BaseIcon>
      )
    case 'arrow-left':
      return (
        <BaseIcon className={className}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </BaseIcon>
      )
    case 'arrow-right':
      return (
        <BaseIcon className={className}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </BaseIcon>
      )
    case 'eye':
      return (
        <BaseIcon className={className}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </BaseIcon>
      )
    case 'eye-slash':
      return (
        <BaseIcon className={className}>
          <path d="M3 3 21 21" />
          <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
          <path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4.1 4.9" />
          <path d="M6.6 6.7A17.4 17.4 0 0 0 2 12s3.5 7 10 7c1.5 0 2.8-.4 4-1" />
        </BaseIcon>
      )
    case 'google':
      return (
        <BaseIcon className={className} viewBox="0 0 448 512" stroke="none" fill="currentColor">
          <path d="M386.6 228.1c1.8 9.7 2.8 19.8 2.8 30.1 0 118.2-79.5 202.3-197.1 202.3C78.9 460.5 0 381.6 0 283.8S78.9 107.1 176.3 107.1c53.2 0 97.8 19.5 132.1 51.5l-53.6 51.5c-14.5-13.8-39.5-29.8-78.5-29.8-67.1 0-121.8 55.7-121.8 123.5s54.7 123.5 121.8 123.5c77.8 0 107-55.8 111.7-84.7H176.3v-67.8h210.3z" />
        </BaseIcon>
      )
    case 'chevron-down':
      return (
        <BaseIcon className={className}>
          <path d="m6 9 6 6 6-6" />
        </BaseIcon>
      )
    case 'chevron-left':
      return (
        <BaseIcon className={className}>
          <path d="m15 18-6-6 6-6" />
        </BaseIcon>
      )
    case 'chevron-right':
      return (
        <BaseIcon className={className}>
          <path d="m9 18 6-6-6-6" />
        </BaseIcon>
      )
    case 'circle-chevron-right':
      return (
        <BaseIcon className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 8 4 4-4 4" />
        </BaseIcon>
      )
    case 'chart':
      return (
        <BaseIcon className={className}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-3" />
        </BaseIcon>
      )
    case 'heart':
      return (
        <BaseIcon className={className}>
          <path d="m12 21-1.4-1.3C5.2 14.9 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3.2 6.4-8.6 11.2L12 21Z" />
        </BaseIcon>
      )
    case 'heart-filled':
      return (
        <BaseIcon className={className} stroke="none" fill="currentColor">
          <path d="m12 21-1.4-1.3C5.2 14.9 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3.2 6.4-8.6 11.2L12 21Z" />
        </BaseIcon>
      )
    case 'key':
      return (
        <BaseIcon className={className}>
          <circle cx="7.5" cy="14.5" r="3.5" />
          <path d="M11 14.5h11" />
          <path d="M18 11.5v6" />
        </BaseIcon>
      )
    case 'list':
      return (
        <BaseIcon className={className}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </BaseIcon>
      )
    case 'plus':
      return (
        <BaseIcon className={className}>
          <path d="M12 5v14M5 12h14" />
        </BaseIcon>
      )
    case 'logout':
      return (
        <BaseIcon className={className}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </BaseIcon>
      )
    case 'user':
      return (
        <BaseIcon className={className}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </BaseIcon>
      )
    case 'user-pen':
      return (
        <BaseIcon className={className}>
          <circle cx="10" cy="8" r="4" />
          <path d="M2.5 20.5a7.5 7.5 0 0 1 9.5-5.9" />
          <path d="m14.5 15.5 5.5-5.5 2 2-5.5 5.5-3 .9.9-2.9Z" />
        </BaseIcon>
      )
    default:
      return null
  }
}

export default Icon
