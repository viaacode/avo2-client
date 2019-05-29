import { set } from 'lodash-es';
import { Component } from 'react';

/**
 * Sets a property which is nested more than one level deep in the state,
 * without deleting any of the other deeply nested values
 * @param component
 * @param path
 * @param value
 */
export function setPartialState(component: Component, path: string, value: any) {
	return new Promise(resolve => {
		const newState = set(component.state, path, value);
		component.setState(newState, resolve);
	});
}
