import React, { ReactElement, useState } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { RadioButton } from './RadioButton';

const RadioButtonStoryComponent = ({
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
			action('RadioButton toggled')(checked);
			setChecked(checked);
		},
	});
};

storiesOf('RadioButton', module)
	.addParameters({ jest: ['RadioButton'] })
	.add('Radio Button', () => (
		<RadioButtonStoryComponent>
			<RadioButton
				name="List1"
				label="One"
				value="One"
				onChange={action('Radio button selected')}
			/>
		</RadioButtonStoryComponent>
	))
	.add('Radio Button default checked', () => (
		<RadioButtonStoryComponent defaultChecked={true}>
			<RadioButton
				name="List2"
				label="One"
				value="One"
				onChange={action('Radio button selected')}
			/>
		</RadioButtonStoryComponent>
	));
