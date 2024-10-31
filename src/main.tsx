import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Header from './screens/Header.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<Header createdBy="AKSHAY KAKADE & MAVERICK JONES" />
    <App />
  </StrictMode>,
)

