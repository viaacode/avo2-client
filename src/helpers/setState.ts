import { cloneDeep, set, unset } from 'lodash-es';
import { Component } from 'react';

/**
 * Promisified setState function
 * @param component
 * @param newState
 */
export function setState(component: Component, newState: any) {
	return new Promise<void>(resolve => {
		component.setState(newState, resolve);
	});
}

/**
 * Sets a property which is nested more than one level deep in the state,
 * without deleting any of the other deeply nested values
 * @param component
 * @param path
 * @param value
 */
export function setDeepState(component: Component, path: string, value: any) {
	return new Promise(resolve => {
		const newState = set(component.state, path, value);
		component.setState(newState, resolve);
	});
}

export function unsetDeepState(component: Component, path: string) {
	return new Promise(resolve => {
		const newState = cloneDeep(component.state);
		unset(newState, path);
		component.setState(newState, resolve);
	});
}
