import React from 'react';

import { storiesOf } from '@storybook/react';

import { Button } from '../..';
import { action } from '../../helpers/action';
import { Dropdown } from './Dropdown';

storiesOf('Dropdown', module)
	.addParameters({ jest: ['Dropdown'] })
	.add('Dropdown', () => (
		<Dropdown label="Show options" onOpen={action('opened')} onClose={action('closed')}>
			<div>OneOneOneOneOneOne</div>
			<div>Two</div>
			<div>Three</div>
			<div>Four</div>
			<div>Five</div>
			<Button className="c-dropdown-menu__close" label="Close" block={true} />
		</Dropdown>
	))
	.add('Dropdown up', () => (
		<div style={{ paddingTop: '100px' }}>
			<Dropdown label="Show options" placement={'top'}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		</div>
	))
	.add('Dropdown autosized', () => (
		<Dropdown label="Show options" autoSize={true}>
			<div>OneOneOneOneOneOne</div>
			<div>Two</div>
			<div>Three</div>
			<div>Four</div>
			<div>Five</div>
		</Dropdown>
	))
	.add('Dropdown autosized bottom-start', () => (
		<Dropdown label="Show options" placement={'bottom-start'} autoSize={true}>
			<div>OneOneOneOneOneOne</div>
			<div>Two</div>
			<div>Three</div>
			<div>Four</div>
			<div>Five</div>
		</Dropdown>
	))
	.add('Dropdown autosized bottom-end', () => (
		<Dropdown label="Show options" placement={'bottom-end'} autoSize={true}>
			<div>OneOneOneOneOneOne</div>
			<div>Two</div>
			<div>Three</div>
			<div>Four</div>
			<div>Five</div>
		</Dropdown>
	))
	.add('Dropdown autosized top-start', () => (
		<div style={{ paddingTop: '100px' }}>
			<Dropdown label="Show options" placement={'top-start'} autoSize={true}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		</div>
	))
	.add('Dropdown autosized top-end', () => (
		<div style={{ paddingTop: '100px' }}>
			<Dropdown label="Show options" placement={'top-end'} autoSize={true}>
				<div>OneOneOneOneOneOne</div>
				<div>Two</div>
				<div>Three</div>
				<div>Four</div>
				<div>Five</div>
			</Dropdown>
		</div>
	));
