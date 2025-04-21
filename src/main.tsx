
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AthroProvider } from './contexts/AthroContext';
import { StudentRecordProvider } from './contexts/StudentRecordContext';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <AuthProvider>
      <StudentRecordProvider>
        <AthroProvider>
          <App />
        </AthroProvider>
      </StudentRecordProvider>
    </AuthProvider>
  );
} else {
  console.error("Root element not found. Cannot render app.");
}
