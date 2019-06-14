import React from 'react';

import { storiesOf } from '@storybook/react';

import { Spinner } from './Spinner';

storiesOf('Spinner', module)
	.addParameters({ jest: ['Spinner'] })
	.add('Spinner', () => <Spinner />)
	.add('Large spinner', () => <Spinner size="large" />);
