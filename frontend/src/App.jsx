import React from 'react';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext';
import { SiteSelectionHome } from './pages/SiteSelectionHome';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <SiteSelectionHome />
      </div>
    </AuthProvider>
  );
}

export default App;
