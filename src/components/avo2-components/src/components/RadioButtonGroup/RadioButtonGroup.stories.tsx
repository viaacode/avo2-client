import React from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { RadioButton } from '../..';
import { RadioButtonGroup } from './RadioButtonGroup';

storiesOf('RadioButtonGroup', module)
	.addParameters({ jest: ['RadioButtonGroup'] })
	.add('RadioButtonGroup', () => (
		<RadioButtonGroup>
			<RadioButton name="List1" label="Fish" value="fish" onChange={action('onChange fish')} />
			<RadioButton name="List1" label="Steak" value="steak" onChange={action('onChange steak')} />
			<RadioButton name="List1" label="Bacon" value="bacon" onChange={action('onChange bacon')} />
		</RadioButtonGroup>
	))
	.add('RadioButtonGroup inline', () => (
		<RadioButtonGroup inline>
			<RadioButton name="List1" label="Fish" value="fish" />
			<RadioButton name="List1" label="Steak" value="steak" />
			<RadioButton name="List1" label="Bacon" value="bacon" />
		</RadioButtonGroup>
	));
