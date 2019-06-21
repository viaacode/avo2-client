import React from 'react';

import { storiesOf } from '@storybook/react';

import { MetaData } from '../MetaData/MetaData';
import { MetaDataItem } from '../MetaDataItem/MetaDataItem';
import { Thumbnail } from '../Thumbnail/Thumbnail';

import { MediaCard } from './MediaCard';
import { MediaCardMetaData, MediaCardThumbnail } from './MediaCard.slots';

storiesOf('MediaCard', module)
	.addParameters({ jest: ['MediaCard'] })
	.add('Media card (vertical)', () => (
		<div className="o-grid-col-bp3-4">
			<MediaCard
				title="What an amazing title!"
				href="#"
				category="collection"
				orientation="vertical"
			>
				<MediaCardThumbnail>
					<Thumbnail
						category="collection"
						src="images/thumbnail.jpg"
						meta="7 items"
						label="collection"
						alt="What an amazing thumbnail!"
					/>
				</MediaCardThumbnail>
				<MediaCardMetaData>
					<MetaData category="collection">
						<MetaDataItem label="vrt" />
						<MetaDataItem label="728" icon="eye" />
						<MetaDataItem label="2d geleden" />
					</MetaData>
				</MediaCardMetaData>
			</MediaCard>
		</div>
	))
	.add('Media card (horizontal)', () => (
		<MediaCard
			title="What an amazing title!"
			href="#"
			category="collection"
			orientation="horizontal"
		>
			<MediaCardThumbnail>
				<Thumbnail
					category="collection"
					src="images/thumbnail.jpg"
					meta="7 items"
					label="collection"
					alt="What an amazing thumbnail!"
				/>
			</MediaCardThumbnail>
			<MediaCardMetaData>
				<MetaData category="collection">
					<MetaDataItem label="vrt" />
					<MetaDataItem label="728" icon="eye" />
					<MetaDataItem label="2d geleden" />
				</MetaData>
			</MediaCardMetaData>
		</MediaCard>
	));
