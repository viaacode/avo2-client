import { mount, shallow } from 'enzyme';
import React from 'react';

import { MetaDataItem } from '../MetaDataItem/MetaDataItem';
import { MetaData } from './MetaData';

describe('<MetaDataItem />', () => {
	it('Should be able to render', () => {
		shallow(
			<MetaData category="video">
				<MetaDataItem label="VRT" />s
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);
	});

	it('Should set the correct className', () => {
		const metaDataComponent = shallow(
			<MetaData category="video">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		expect(metaDataComponent.hasClass('c-meta-data')).toEqual(true);
	});

	it('Should set the correct className with each category', () => {
		const metaDataCollectionComponent = shallow(
			<MetaData category="collection">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		const metaDataVideoComponent = shallow(
			<MetaData category="video">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		const metaDataAudioComponent = shallow(
			<MetaData category="audio">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		const metaDataMapComponent = shallow(
			<MetaData category="map">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		expect(metaDataCollectionComponent.hasClass('c-meta-data--collection')).toEqual(true);
		expect(metaDataVideoComponent.hasClass('c-meta-data--video')).toEqual(true);
		expect(metaDataAudioComponent.hasClass('c-meta-data--audio')).toEqual(true);
		expect(metaDataMapComponent.hasClass('c-meta-data--map')).toEqual(true);
	});

	it('Should set the correct className when spaced is passed', () => {
		const metaDataComponent = shallow(
			<MetaData category="video" spaced>
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		expect(metaDataComponent.hasClass('c-meta-data--spaced-out')).toEqual(true);
	});

	it('Should correctly pass children', () => {
		const metaDataComponent = mount(
			<MetaData category="video">
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		const metaDataItems = metaDataComponent.find(MetaDataItem);

		expect(metaDataItems).toHaveLength(3);
	});
});
