import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { DatePicker } from './DatePicker';

storiesOf('DatePicker', module)
	.addParameters({ jest: ['DatePicker'] })
	.add('DatePicker', () => (
		<Fragment>
			<DatePicker onChange={action('onChange')} />
			<div className="u-spacer-bottom" />
			<DatePicker disabled />
		</Fragment>
	));
