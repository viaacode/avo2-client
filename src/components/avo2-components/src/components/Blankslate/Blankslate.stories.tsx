import React from 'react';

import { storiesOf } from '@storybook/react';

import { Blankslate } from './Blankslate';

storiesOf('Blankslate', module)
	.addParameters({ jest: ['Blankslate'] })
	.add('Blankslate', () => (
		<Blankslate
			title="This is a blank slate"
			body="Use it to provide information when no dynamic content exists."
		/>
	))
	.add('Spacious blankslate', () => (
		<Blankslate
			title="This is a spacious blank slate"
			body="Use it to provide information when no dynamic content exists."
			spacious
		/>
	))
	.add('Blankslate with icon', () => (
		<Blankslate
			title="This is a blank slate"
			body="Use it to provide information when no dynamic content exists."
			icon="search"
		/>
	))
	.add('Blankslate content', () => (
		<Blankslate
			title="This is a blank slate"
			body="Use it to provide information when no dynamic content exists."
			icon="search"
		>
			<div className="u-spacer-top-l">
				Extra content for the blankslate can be passed via <code>children</code>.
			</div>
		</Blankslate>
	));
