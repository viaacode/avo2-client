import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { loremIpsum } from 'lorem-ipsum';
import { Navbar } from './Navbar';

const content = 'navbar content';

storiesOf('Navbar', module)
	.addParameters({ jest: ['Container'] })
	.add('Navbar', () => (
		<Fragment>
			<Navbar>{content}</Navbar>
			<div style={{ height: '200px' }} />
			<Navbar placement="bottom">{content}</Navbar>
		</Fragment>
	))
	.add('Fixed navbar', () => (
		<Fragment>
			<Navbar position="fixed" background={'alt'}>
				{content}
			</Navbar>
			{loremIpsum({ count: 300 })}
		</Fragment>
	))
	.add('Auto height navbar', () => (
		<Navbar autoHeight={true}>
			<Fragment>{content}</Fragment>
			<br />
			<Fragment>{content}</Fragment>
			<br />
			<Fragment>{content}</Fragment>
			<br />
			<Fragment>{content}</Fragment>
			<br />
			<Fragment>{content}</Fragment>
		</Navbar>
	))
	.add('Navbar backgrounds', () => (
		<Fragment>
			<Navbar>{`${content} on a transparent background`}</Navbar>
			<br />
			<Navbar background="white">{`${content} on a 'white' background`}</Navbar>
			<br />
			<Navbar background="alt">{`${content} on an 'alt' background`}</Navbar>
			<br />
			<Navbar background="inverse">{`${content} on an 'inverse' background`}</Navbar>
		</Fragment>
	));
