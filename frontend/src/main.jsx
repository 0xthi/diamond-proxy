import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppKitProvider } from './AppKitProvider' // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppKitProvider> {/* Wrap your App with AppKitProvider */}
      <App/>
      <w3m-button/>
    </AppKitProvider>
  </React.StrictMode>
)
