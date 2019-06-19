import React from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { RadioButton } from './RadioButton';

storiesOf('RadioButton', module)
	.addParameters({ jest: ['RadioButton'] })
	.add('Radio Button', () => (
		<RadioButton name="List1" label="One" value="One" onChange={action('Radio button selected')} />
	))
	.add('Radio Button default checked', () => (
		<RadioButton
			name="List2"
			label="One"
			value="One"
			onChange={action('Radio button selected')}
			defaultChecked
		/>
	));
