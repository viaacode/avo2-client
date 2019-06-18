import React, { Fragment, ReactElement, useState } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { Checkbox } from './Checkbox';

const CheckboxStoryComponent = ({
	children,
	defaultChecked,
}: {
	children: ReactElement;
	defaultChecked?: boolean;
}) => {
	const [checked, setChecked] = useState(defaultChecked);

	return React.cloneElement(children, {
		checked,
		onChange: (checked: boolean) => {
			action('Checkbox toggled')(checked);
			setChecked(checked);
		},
	});
};

storiesOf('Checkbox', module)
	.addParameters({ jest: ['Checkbox'] })
	.add('Checkbox', () => (
		<CheckboxStoryComponent>
			<Checkbox label="One" />
		</CheckboxStoryComponent>
	))
	.add('Checkbox default checked', () => (
		<CheckboxStoryComponent defaultChecked={true}>
			<Checkbox label="One" />
		</CheckboxStoryComponent>
	))
	.add('Checkbox default unchecked', () => (
		<CheckboxStoryComponent defaultChecked={false}>
			<Checkbox label="One" />
		</CheckboxStoryComponent>
	));
