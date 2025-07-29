import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConceptosProvider } from './components/ConceptosContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConceptosProvider>
      <App />
    </ConceptosProvider>
  </React.StrictMode>
)
