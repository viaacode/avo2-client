import { action as _action } from '@storybook/addon-actions';

// We add a .toString() property to the actions to reconcile with storybook-addon-jsx
export const action = (name: string) => {
	const innerAction = _action(name);
	innerAction.toString = () => `action('${name}')`;
	return innerAction;
};
