import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import React from 'react';
import ReactDOM from 'react-dom';

import pkg from '../package.json';

import App from './App';

// Expose app info through the window object
window.APP_INFO = {
	mode: process.env.NODE_ENV,
	version: pkg.version,
};

// Set moment language to Dutch
setDefaultOptions({
	locale: nlBE,
});

ReactDOM.render(<App />, document.getElementById('root'));
