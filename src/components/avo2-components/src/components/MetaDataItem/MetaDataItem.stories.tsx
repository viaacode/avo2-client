import React from 'react';

import { storiesOf } from '@storybook/react';

import { MetaData } from '../MetaData/MetaData';
import { MetaDataItem } from './MetaDataItem';

storiesOf('MetaDataItem', module)
	.addParameters({ jest: ['MetaDataItem'] })
	.add('Meta data item', () => (
		<MetaData>
			<MetaDataItem label="VRT" />
		</MetaData>
	))
	.add('Meta data item with icon', () => (
		<MetaData>
			<MetaDataItem icon="headphone" label="768" />
		</MetaData>
	));
