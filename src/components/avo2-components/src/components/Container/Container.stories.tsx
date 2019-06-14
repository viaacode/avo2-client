import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';
import { loremIpsum } from 'lorem-ipsum';

import { Container } from './Container';

const content = loremIpsum({ count: 10 });

storiesOf('Container', module)
	.addParameters({ jest: ['Container'] })
	.add('Horizontal containers', () => (
		<Fragment>
			<Container mode="horizontal">{content}</Container>
			<br />
			<Container mode="horizontal" size="large">
				{content}
			</Container>
			<br />
			<Container mode="horizontal" size="medium">
				{content}
			</Container>
			<br />
			<Container mode="horizontal" size="small">
				{content}
			</Container>
		</Fragment>
	))
	.add('Vertical containers', () => (
		<Fragment>
			<Container mode="vertical" size="small">
				{content}
			</Container>
			<Container mode="vertical">{content}</Container>
			<Container mode="vertical" size="medium">
				{content}
			</Container>
			<Container mode="vertical" size="large">
				{content}
			</Container>
		</Fragment>
	))
	.add('Bordered containers', () => (
		<Container mode="vertical" bordered>
			{content}
		</Container>
	))
	.add('Container backgrounds', () => (
		<Fragment>
			<Container mode="vertical">{content}</Container>
			<Container mode="vertical" background="alt">
				{content}
			</Container>
			<Container mode="vertical" background="inverse">
				<p style={{ color: 'white' }}>{content}</p>
			</Container>
		</Fragment>
	))
	.add('Combined containers', () => (
		<Fragment>
			<Container mode="vertical" size="large">
				<Container mode="horizontal">{content}</Container>
			</Container>
			<Container mode="vertical" background="alt" size="large">
				<Container mode="horizontal">{content}</Container>
			</Container>
			<Container mode="vertical" size="large">
				<Container mode="horizontal">{content}</Container>
			</Container>
			<Container mode="vertical" background="alt" size="large">
				<Container mode="horizontal">{content}</Container>
			</Container>
		</Fragment>
	));
