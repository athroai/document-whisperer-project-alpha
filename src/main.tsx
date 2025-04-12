
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AthroProvider } from './contexts/AthroContext';
import { StudentRecordProvider } from './contexts/StudentRecordContext';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <StudentRecordProvider>
        <AthroProvider>
          <App />
        </AthroProvider>
      </StudentRecordProvider>
    </AuthProvider>
  </BrowserRouter>
);
