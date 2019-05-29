import { set } from 'lodash-es';
import { Component } from 'react';

export function setPartialState(component: Component, path: string, value: any) {
	return new Promise(resolve => {
		const newState = set(component.state, path, value);
		component.setState(newState, resolve);
	});
}
