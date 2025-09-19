import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import React from 'react';
import { createRoot } from 'react-dom/client';

import pkg from '../package.json';

import App from './Root';

// Expose app info through the window object
window.APP_INFO = {
	mode: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
	version: pkg.version,
};

// Set moment language to Dutch
setDefaultOptions({
	locale: nlBE,
});

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
