window.mountProductCustomizer = function (selector = "#customizer-root", props = {}) {
  const container = document.querySelector(selector);
  if (!container) {
    console.warn("No container found for customizer");
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(<ProductCustomizer {...props} />);
};