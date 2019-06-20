import { mount, shallow } from 'enzyme';
import React from 'react';

import { MetaDataItem } from '../MetaDataItem/MetaDataItem';
import { MetaData } from './MetaData';

describe('<MetaDataItem />', () => {
	it('Should be able to render', () => {
		shallow(
			<MetaData>
				<MetaDataItem label="VRT" />s
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);
	});

	it('Should set the correct className', () => {
		const metaDataComponent = shallow(
			<MetaData>
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		expect(metaDataComponent.hasClass('c-meta-data')).toEqual(true);
	});

	it('Should set the correct className with each category', () => {
		const metaDataComponent = shallow(
			<MetaData>
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		expect(metaDataComponent.hasClass('c-meta-data--video')).toEqual(true);
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
			<MetaData>
				<MetaDataItem label="VRT" />
				<MetaDataItem icon="headphone" label="738" />
				<MetaDataItem label="2d geleden" />
			</MetaData>
		);

		const metaDataItems = metaDataComponent.find('.c-meta-data__item');

		expect(metaDataItems).toHaveLength(3);
	});
});
