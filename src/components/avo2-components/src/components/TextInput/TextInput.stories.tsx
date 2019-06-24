import React, { Fragment, ReactElement, useState } from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { TextInput } from './TextInput';

const TextInputStoryComponent = ({
	children,
	defaultValue = '',
}: {
	children: ReactElement;
	defaultValue?: string;
}) => {
	const [value, setValue] = useState(defaultValue);

	return React.cloneElement(children, {
		value,
		onChange: (value: string) => {
			action('Input changed')(value);
			setValue(value);
		},
	});
};

storiesOf('TextInput', module)
	.addParameters({ jest: ['TextInput'] })
	.add('TextInput', () => (
		<Fragment>
			<TextInputStoryComponent>
				<TextInput placeholder="Type something here..." onChange={action('onChange')} />
			</TextInputStoryComponent>
			<div className="u-spacer-bottom" />
			<TextInputStoryComponent>
				<TextInput disabled placeholder="No typing here..." />
			</TextInputStoryComponent>
		</Fragment>
	))
	.add('TextInput without placeholder', () => (
		<Fragment>
			<TextInputStoryComponent>
				<TextInput onChange={action('onChange')} />
			</TextInputStoryComponent>
			<div className="u-spacer-bottom" />
			<TextInputStoryComponent>
				<TextInput disabled />
			</TextInputStoryComponent>
		</Fragment>
	))
	.add('TextInput with default value', () => (
		<Fragment>
			<TextInputStoryComponent>
				<TextInput
					placeholder="And this is the placeholder"
					value="This is the default value"
					onChange={action('onChange')}
				/>
			</TextInputStoryComponent>
			<div className="u-spacer-bottom" />
			<TextInputStoryComponent defaultValue="This is the default value">
				<TextInput disabled />
			</TextInputStoryComponent>
		</Fragment>
	))
	.add('TextInput with icon', () => (
		<Fragment>
			<TextInputStoryComponent>
				<TextInput
					icon="search"
					placeholder="Type something here..."
					onChange={action('onChange')}
				/>
			</TextInputStoryComponent>
			<div className="u-spacer-bottom" />
			<TextInputStoryComponent>
				<TextInput icon="x" disabled placeholder="No typing here..." />
			</TextInputStoryComponent>
		</Fragment>
	));
