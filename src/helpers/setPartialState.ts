import { Component } from 'react';
import * as _ from '../helpers/lodash-imports';

export function setPartialState(component: Component, path: string, value: any) {
	return new Promise(resolve => {
		const newState = _.set(component.state, path, value);
		component.setState(newState, resolve);
	});
}
