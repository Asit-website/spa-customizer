// embed-widget.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomizerLayout from './app/CustomizerLayout'

window.mountProductCustomizer = function (selector = '#customizer-root', props = {}) {
  const container = document.querySelector(selector)
  if (container) {
    const root = ReactDOM.createRoot(container)
    root.render(<CustomizerLayout {...props} />)
  } else {
    console.warn('No mount target found for ProductCustomizer')
  }
}
