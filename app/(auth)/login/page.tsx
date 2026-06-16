import fs from 'fs'
import path from 'path'
import LoginForm from './LoginForm'

export default function LoginPage() {
  let logoSrc = '/mjw-logo.png'
  try {
    const logoPath = path.join(process.cwd(), 'public', 'mjw-logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {
    // fallback to public URL if file read fails
  }
  return <LoginForm logoSrc={logoSrc} />
}
