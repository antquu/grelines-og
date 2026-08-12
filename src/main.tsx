import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'

console.log(`_
  __ _ _ __ | |_ __ _ _ _
 / _\` | '_ \\| __/ _\` | | | |
| (_| | | | | || (_| | |_| |
 \\__,_|_| |_|\\__\\__, |\\__,_|
                   |_| 
                   
       made by antqu • github.com/antquu`
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
