import React from 'react';

import { storiesOf } from '@storybook/react';

import { Checkbox } from '../Checkbox/Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

storiesOf('CheckboxGroup', module)
	.addParameters({ jest: ['CheckboxGroup'] })
	.add('CheckboxGroup', () => (
		<CheckboxGroup>
			<Checkbox label="Aluminium" />
			<Checkbox label="Cadmium" />
			<Checkbox label="Dubnium" />
		</CheckboxGroup>
	))
	.add('CheckboxGroup inline', () => (
		<CheckboxGroup inline={true}>
			<Checkbox label="Aluminium" />
			<Checkbox label="Cadmium" />
			<Checkbox label="Dubnium" />
		</CheckboxGroup>
	));
