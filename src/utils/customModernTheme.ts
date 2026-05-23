export const injectCustomModernColor = (hex: string) => {
  let styleEl = document.getElementById('custom-modern-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-modern-style';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    .theme-modern-custom {
      --accent-color: ${hex} !important;
      --accent-secondary: color-mix(in srgb, ${hex} 85%, black) !important;
      --color-indigo-50: color-mix(in srgb, ${hex} 5%, white) !important;
      --color-indigo-100: color-mix(in srgb, ${hex} 10%, white) !important;
      --color-indigo-200: color-mix(in srgb, ${hex} 30%, white) !important;
      --color-indigo-300: color-mix(in srgb, ${hex} 50%, white) !important;
      --color-indigo-400: color-mix(in srgb, ${hex} 70%, white) !important;
      --color-indigo-500: ${hex} !important;
      --color-indigo-600: color-mix(in srgb, ${hex} 80%, black) !important;
      --color-indigo-700: color-mix(in srgb, ${hex} 60%, black) !important;
      --color-indigo-800: color-mix(in srgb, ${hex} 40%, black) !important;
      --color-indigo-900: color-mix(in srgb, ${hex} 20%, black) !important;
      --color-indigo-950: color-mix(in srgb, ${hex} 10%, black) !important;
    }
    .modern-custom-preview-1 {
      background-color: color-mix(in srgb, ${hex} 80%, black) !important;
    }
    .modern-custom-preview-2 {
      background-color: color-mix(in srgb, ${hex} 80%, white) !important;
    }
  `;
};
