import React from 'react';
import ReactDOM from 'react-dom';

import pkg from '../package.json';

import { CustomWindow } from './shared/types/CustomWindow';

import './components/avo2-components/src/styles/main.css';
import './components/avo2-components/src/styles/styleguide.css';

import App from './App';

(window as CustomWindow).APP_INFO = {
	mode: process.env.NODE_ENV,
	version: pkg.version,
};

ReactDOM.render(<App />, document.getElementById('root'));
