import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PluginApp from './PluginApp.jsx'
import HealthOpsApp from './HealthOpsApp.jsx'

// Mode detection: URL param or env var
const urlParams = new URLSearchParams(window.location.search);
const modeParam = urlParams.get('mode');
const envMode = import.meta.env.VITE_PLUGIN_MODE || '';

// Resolve which app to render
let RootComponent = App; // default: full RCM dashboard
if (modeParam === 'healthops' || envMode === 'healthops') {
  RootComponent = HealthOpsApp;
} else if (modeParam === 'plugin' || envMode === 'true' || envMode === 'plugin') {
  RootComponent = PluginApp;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
