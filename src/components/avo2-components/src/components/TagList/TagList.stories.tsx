import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '../../helpers/action';

import { TagList } from './TagList';

const tags = [
	'Aluminium',
	'Cadmium',
	'Dubnium',
	'Potassium',
	'Vanadium',
	'Palladium',
	'Polonium',
	'Rhodium',
	'Yttrium',
	'Uranium',
];

storiesOf('TagList', module)
	.addParameters({ jest: ['TagList'] })
	.add('TagList', () => <TagList tags={tags} />)
	.add('TagList with closable tags', () => (
		<TagList tags={tags} closable onTagClosed={action('Tag closed')} />
	))
	.add('TagList without swatches', () => <TagList tags={tags} swatches={false} />)
	.add('TagList with borderless tags', () => <TagList tags={tags} bordered={false} />)
	.add('Minimalist TagList', () => <TagList tags={tags} swatches={false} bordered={false} />);
