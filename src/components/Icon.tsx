const assets = import.meta.glob<string>('../assets/*.svg', { eager: true, query: '?url', import: 'default' })
export type IconName = 'chevrons-up-down' | 'sparkles' | 'monitor' | 'smartphone' | 'window-dots' | 'lock-keyhole' | 'artwork-disc' | 'arrow-up-right' | 'copy' | 'code-xml' | 'menu' | 'search' | 'x' | 'check' | 'search-x' | 'check1' | 'circle-check'

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <img src={assets[`../assets/${name}.svg`]} alt="" aria-hidden="true" className={`design-icon ${className}`} />
}
