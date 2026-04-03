import './globals.css';
import { Web3Provider } from '../../src/app/components/Web3provider';

export const metadata = {
  title: 'SwiftMint',
  description: 'Professional crypto trading platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}