import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseProvider } from './Firebase/FirebaseContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);
