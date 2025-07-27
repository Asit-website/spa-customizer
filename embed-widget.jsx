
import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomizerLayout from './app/CustomizerLayout'


if (typeof ReactDOM === 'undefined') { console.error('ReactDOM not found'); }
window.mountProductCustomizer = function (selector = '#customizer-root', props = {}) {
  const container = document.querySelector(selector)
  if (container) {
    const root = ReactDOM.createRoot(container)
    root.render(
    <>
      <div className="bg-blue-500 text-white text-xl p-4 rounded-lg">Tailwind is working 🎉</div>
      <div className="bg-blue-500 text-white text-xl">Tailwind works</div>
      <CustomizerLayout {...props} />
    </>
    )
  } else {
    console.warn('No mount target found for ProductCustomizer')
  }
}