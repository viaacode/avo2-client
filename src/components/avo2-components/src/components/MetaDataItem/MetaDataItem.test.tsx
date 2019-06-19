import { shallow } from 'enzyme';
import React from 'react';

import { MetaDataItem } from './MetaDataItem';

describe('<MetaDataItem />', () => {
	it('Should be able to render', () => {
		shallow(<MetaDataItem label="VRT" />);
	});

	it('Should set the correct className', () => {
		const metaDataItemComponent = shallow(<MetaDataItem label="VRT" />);

		expect(metaDataItemComponent.hasClass('c-meta-data__item')).toEqual(true);
	});

	it('Should set the correct className when icon is passed', () => {
		const metaDataItemComponent = shallow(<MetaDataItem icon="headphone" label="768" />);

		expect(metaDataItemComponent.hasClass('c-meta-data-item--icon')).toEqual(true);
	});
});
