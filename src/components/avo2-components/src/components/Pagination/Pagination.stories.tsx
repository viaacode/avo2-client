import React from 'react';

import { storiesOf } from '@storybook/react';

import { action } from '../../helpers/action';

import { Pagination } from './Pagination';

storiesOf('Pagination', module)
	.addParameters({ jest: ['Pagination'] })
	.add('Pagination', () => <Pagination pageCount={20} onPageChange={action('onPageChange')} />)
	.add('Pagination with options', () => (
		<Pagination
			pageCount={20}
			displayCount={7}
			currentPage={9}
			onPageChange={action('onPageChange')}
		/>
	));
