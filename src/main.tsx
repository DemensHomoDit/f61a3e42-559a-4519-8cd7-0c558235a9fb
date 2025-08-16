import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SidebarProvider>
      <App />
    </SidebarProvider>
  </AuthProvider>
);
