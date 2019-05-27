import React from 'react';
import ReactDOM from 'react-dom';

import pkg from '../package.json';

import { CustomWindow } from './shared/types/CustomWindow';

import App from './App';

(window as CustomWindow).APP_INFO = {
	mode: process.env.NODE_ENV,
	version: pkg.version,
};

ReactDOM.render(<App />, document.getElementById('root'));
