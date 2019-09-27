import moment from 'moment';
import 'moment/locale/nl-be';
import React from 'react';
import ReactDOM from 'react-dom';

import '@viaa/avo2-components/dist/styles/main.css';

import pkg from '../package.json';
import App from './App';
import { CustomWindow } from './shared/types/global';

// Expose app info through the window object
(window as CustomWindow).APP_INFO = {
	mode: process.env.NODE_ENV,
	version: pkg.version,
};

// Set moment language to dutch
moment.locale('nl-be');

ReactDOM.render(<App />, document.getElementById('root'));
