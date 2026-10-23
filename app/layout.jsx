import './globals.css'

export const metadata = {
  title: 'CivilPulse - High-Yield Daily UPSC & State PSC Intel',
  description: 'Zero fluff, syllabus-aligned daily news intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
