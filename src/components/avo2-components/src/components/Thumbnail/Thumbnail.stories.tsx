import React from 'react';

import { storiesOf } from '@storybook/react';

import { Thumbnail } from './Thumbnail';

storiesOf('Thumbnail', module)
	.addParameters({ jest: ['Thumbnail'] })
	.add('Thumbnail (image)', () => (
		<div className="o-grid-col-bp3-4">
			<Thumbnail src="images/thumbnail.jpg" meta="4 items" category="video" label="collectie" />
		</div>
	))
	.add('Thumbnail (placeholder)', () => (
		<div className="o-grid-col-bp3-4">
			<Thumbnail meta="4 items" category="collection" label="collectie" />
		</div>
	))
	.add('Thumbnail with label', () => (
		<div className="o-grid-col-bp3-4">
			<Thumbnail
				src="images/thumbnail.jpg"
				category="collection"
				meta="4 items"
				label="collectie"
			/>
		</div>
	))
	.add('Thumbnail without label', () => (
		<div className="o-grid-col-bp3-4">
			<Thumbnail src="images/thumbnail.jpg" category="video" meta="2:22" />
		</div>
	))
	.add('Thumbnail without meta', () => (
		<div className="o-grid-col-bp3-4">
			<Thumbnail src="images/thumbnail.jpg" category="video" label="collectie" />
		</div>
	));
