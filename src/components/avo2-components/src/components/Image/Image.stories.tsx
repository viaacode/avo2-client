import React from 'react';

import { storiesOf } from '@storybook/react';

import { Image } from './Image';

storiesOf('Image', module)
	.addParameters({ jest: ['Image'] })
	.add('Image', () => (
		<Image src="https://source.unsplash.com/random/400x300" alt="random 400x300 image" />
	))
	.add('Image full width', () => (
		<Image wide src="https://source.unsplash.com/random/1600x900" alt="random 1600x900 image" />
	));
