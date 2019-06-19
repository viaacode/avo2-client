import React from 'react';

import { storiesOf } from '@storybook/react';

import { MediaCard } from './MediaCard';

const mockMetaData = [
	{
		label: 'VRT',
	},
	{
		icon: 'eye',
		label: '728',
	},
	{
		label: '2d geleden',
	},
];

storiesOf('MediaCard', module)
	.addParameters({ jest: ['MediaCard'] })
	.add('Medias card (vertical)', () => (
		<div className="o-grid-col-bp3-4">
			<MediaCard
				title="What an amazing title!"
				href="#"
				metaData={mockMetaData}
				category="collection"
				thumbnailSrc="images/thumbnail.jpg"
				thumbnailMeta="7 items"
				thumbnailLabel="colllection"
				thumbnailAlt="What an amazing title!"
			/>
		</div>
	))
	.add('Media card (horizontal)', () => (
		<div className="o-grid-col-bp4-4">
			<MediaCard
				orientation="horizontal"
				title="What an amazing title!"
				href="#"
				metaData={mockMetaData}
				category="collection"
				thumbnailSrc="images/thumbnail.jpg"
				thumbnailMeta="7 items"
				thumbnailLabel="colllection"
				thumbnailAlt="What an amazing title!"
			/>
		</div>
	));
