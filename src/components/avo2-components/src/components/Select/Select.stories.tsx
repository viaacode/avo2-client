import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { Select } from './Select';

const options = [
	{ label: 'Aluminium', value: 'Al' },
	{ label: 'Cadmium', value: 'Cd' },
	{ label: 'Dubnium', value: 'Db' },
	{ label: 'Potassium', value: 'K' },
	{ label: 'Vanadium', value: 'V' },
	{ label: 'Palladium', value: 'Pd' },
	{ label: 'Polonium', value: 'Po' },
	{ label: 'Rhodium (disabled)', value: 'Rh', disabled: true },
	{ label: 'Yttrium (disabled)', value: 'Y', disabled: true },
	{ label: 'Uranium (disabled)', value: 'U', disabled: true },
];

storiesOf('Select', module)
	.addParameters({ jest: ['Select'] })
	.add('Select', () => (
		<Fragment>
			<Select options={options} value="Db" onChange={action('onChange')} />
		</Fragment>
	));
