import moment from 'moment';
import 'moment/locale/nl-be';
import React from 'react';
import ReactDOM from 'react-dom';

import pkg from '../package.json';

import App from './App';

// Expose app info through the window object
window.APP_INFO = {
	mode: process.env.NODE_ENV,
	version: pkg.version,
};

// Set moment language to dutch
moment.locale('nl-be');

ReactDOM.render(<App />, document.getElementById('root'));
