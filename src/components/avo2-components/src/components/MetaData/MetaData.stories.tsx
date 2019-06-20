import React from 'react';

import { storiesOf } from '@storybook/react';

import { MetaDataItem } from '../MetaDataItem/MetaDataItem';
import { MetaData } from './MetaData';

storiesOf('MetaData', module)
	.addParameters({ jest: ['MetaData'] })
	.add('Meta data (audio)', () => (
		<MetaData>
			<MetaDataItem label="VRT" />
			<MetaDataItem icon="headphone" label="738" />
			<MetaDataItem label="2d geleden" />
		</MetaData>
	))
	.add('Meta data (video)', () => (
		<MetaData>
			<MetaDataItem label="VRT" />
			<MetaDataItem icon="eye" label="738" />
			<MetaDataItem label="2d geleden" />
		</MetaData>
	))
	.add('Meta data (collection)', () => (
		<MetaData>
			<MetaDataItem label="7 items" />
			<MetaDataItem icon="eye" label="738" />
			<MetaDataItem label="2d geleden" />
		</MetaData>
	));
