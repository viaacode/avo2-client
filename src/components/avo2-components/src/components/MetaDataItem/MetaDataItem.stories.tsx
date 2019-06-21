import React from 'react';

import { storiesOf } from '@storybook/react';

import { MetaData } from '../MetaData/MetaData';
import { MetaDataItem } from './MetaDataItem';

storiesOf('MetaDataItem', module)
	.addParameters({ jest: ['MetaDataItem'] })
	.add('Meta data item', () => (
		<MetaData category="video">
			<MetaDataItem label="VRT" />
		</MetaData>
	))
	.add('Meta data item with icon', () => (
		<MetaData category="audio">
			<MetaDataItem icon="headphone" label="768" />
		</MetaData>
	));
