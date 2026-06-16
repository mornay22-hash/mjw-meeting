import fs from 'fs'
import path from 'path'
import SignupForm from './SignupForm'

export default function SignupPage() {
  let logoSrc = '/mjw-logo.png'
  try {
    const logoPath = path.join(process.cwd(), 'public', 'mjw-logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {
    // fallback to public URL
  }
  return <SignupForm logoSrc={logoSrc} />
}
