import React from 'react';

import { storiesOf } from '@storybook/react';

import { Avatar } from './Avatar';

storiesOf('Avatar', module)
	.addParameters({ jest: ['Avatar', 'AvatarIcon'] })
	.add('Avatar', () => <Avatar initials="JD" />)
	.add('Small avatar', () => <Avatar initials="JD" size="small" />)
	.add('Avatar with image', () => (
		<Avatar initials="JD" image="https://api.adorable.io/avatars/128/john" />
	))
	.add('Avatar with name', () => <Avatar initials="JD" name="John Doe" />)
	.add('Avatar with name and title', () => (
		<Avatar initials="JD" name="John Doe" title="Quality Assurance Tester" />
	));
