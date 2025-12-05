import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './AuthProvider.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import { FrontChannelLogout } from './FrontChannelLogout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />} index />
          <Route path="frontchannel-logout" element={<FrontChannelLogout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
