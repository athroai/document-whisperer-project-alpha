
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AthroProvider } from './contexts/AthroContext';
import { StudentRecordProvider } from './contexts/StudentRecordContext';
import { BrowserRouter as Router } from 'react-router-dom';

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <Router>
      <StudentRecordProvider>
        <AthroProvider>
          <App />
        </AthroProvider>
      </StudentRecordProvider>
    </Router>
  );
} else {
  console.error("Root element not found. Cannot render app.");
}
