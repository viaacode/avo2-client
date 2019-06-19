import { mount, shallow } from 'enzyme';
import React from 'react';

import { MediaCard } from '../MediaCard/MediaCard';

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

describe('<MediaCard />', () => {
	it('Should be able to render', () => {
		shallow(<MediaCard title="What an amazing title!" href="#" category="collection" />);
	});

	it('Should set the correct className', () => {
		const mediaCardComponent = shallow(
			<MediaCard title="What an amazing title!" href="#" category="collection" />
		);

		expect(mediaCardComponent.hasClass('c-media-card')).toEqual(true);
	});

	it('Should set the correct className for each category', () => {
		const mediaCardComponent = shallow(
			<MediaCard title="What an amazing title!" href="#" category="collection" />
		);

		expect(mediaCardComponent.hasClass('c-media-card--collection')).toEqual(true);
	});

	it('Should render Thumbnail component', () => {
		const mediaCardComponent = mount(
			<MediaCard title="What an amazing title!" href="#" category="collection" />
		);

		const thumbnailElement = mediaCardComponent.find('.c-thumbnail');

		expect(thumbnailElement).toHaveLength(1);
	});

	it('Should not render MetaData component when none is passed.', () => {
		const mediaCardComponent = mount(
			<MediaCard title="What an amazing title!" href="#" category="collection" />
		);

		const metaDataElement = mediaCardComponent.find('.c-meta-data');

		expect(metaDataElement).toHaveLength(0);
	});

	it('Should render MetaData component when metaData is passed.', () => {
		const mediaCardComponent = mount(
			<MediaCard
				title="What an amazing title!"
				metaData={mockMetaData}
				href="#"
				category="collection"
			/>
		);

		const metaDataElement = mediaCardComponent.find('.c-meta-data');

		expect(metaDataElement).toHaveLength(1);
	});

	it('Should pass href property to child element.', () => {
		const mediaCardComponent = mount(
			<MediaCard
				title="What an amazing title!"
				metaData={mockMetaData}
				href="#"
				category="collection"
			/>
		);

		const metaCardThumbElement = mediaCardComponent.find('.c-media-card-thumb');

		expect(metaCardThumbElement.prop('href')).toEqual('#');
	});
});
