import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; // Make sure this import is here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 This BrowserRouter MUST wrap App 👇 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* 👆 This BrowserRouter MUST wrap App 👆 */}
  </React.StrictMode>,
)