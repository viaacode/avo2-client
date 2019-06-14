import React from 'react';

import { storiesOf } from '@storybook/react';

import { Badge } from './Badge';

storiesOf('Badge', module)
	.addParameters({ jest: ['Badge'] })
	.add('Badge', () => <Badge text="Pending approval" />)
	.add('Success badge', () => <Badge text="Approval granted" type="success" />)
	.add('Error badge', () => <Badge text="Approval denied" type="error" />);
