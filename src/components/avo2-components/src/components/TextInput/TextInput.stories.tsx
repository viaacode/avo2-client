import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { TextInput } from './TextInput';

storiesOf('TextInput', module)
	.addParameters({ jest: ['TextInput'] })
	.add('TextInput', () => (
		<Fragment>
			<TextInput placeholder="Type something here..." onChange={action('onChange')} />
			<div className="u-spacer-bottom" />
			<TextInput disabled placeholder="No typing here..." />
		</Fragment>
	))
	.add('TextInput without placeholder', () => (
		<Fragment>
			<TextInput onChange={action('onChange')} />
			<div className="u-spacer-bottom" />
			<TextInput disabled />
		</Fragment>
	))
	.add('TextInput with default value', () => (
		<Fragment>
			<TextInput
				placeholder="And this is the placeholder"
				defaultValue="This is the default value"
				onChange={action('onChange')}
			/>
			<div className="u-spacer-bottom" />
			<TextInput disabled defaultValue="This is the default value" />
		</Fragment>
	))
	.add('TextInput with icon', () => (
		<Fragment>
			<TextInput icon="search" placeholder="Type something here..." onChange={action('onChange')} />
			<div className="u-spacer-bottom" />
			<TextInput icon="x" disabled placeholder="No typing here..." />
		</Fragment>
	));
