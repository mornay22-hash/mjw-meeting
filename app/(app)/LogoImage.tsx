'use client'

export default function LogoImage() {
  return (
    <img
      src="/mjw-logo.png"
      alt="MJW"
      width={34}
      height={34}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
