import React from 'react';

import { storiesOf } from '@storybook/react';

import { Column } from './Column';
import { Grid } from './Grid';

const GridDecorator = (story: Function) => (
	<div className="br-styleguide">
		<div id="component-01-o-grid">{story()}</div>
	</div>
);

storiesOf('Grid', module)
	.addParameters({ jest: ['Grid', 'Column'] })
	.addDecorator(GridDecorator)
	.add('Grid', () => (
		<Grid>
			<Column size="12">12</Column>

			<Column size="11">11</Column>
			<Column size="1">1</Column>

			<Column size="10">10</Column>
			<Column size="2">2</Column>

			<Column size="9">9</Column>
			<Column size="3">3</Column>

			<Column size="8">8</Column>
			<Column size="4">4</Column>

			<Column size="7">7</Column>
			<Column size="5">5</Column>

			<Column size="6">6</Column>
			<Column size="6">6</Column>

			<Column size="4">4</Column>
			<Column size="4">4</Column>
			<Column size="4">4</Column>

			<Column size="3">3</Column>
			<Column size="3">3</Column>
			<Column size="3">3</Column>
			<Column size="3">3</Column>

			<Column size="2">2</Column>
			<Column size="2">2</Column>
			<Column size="2">2</Column>
			<Column size="2">2</Column>
			<Column size="2">2</Column>
			<Column size="2">2</Column>

			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>
			<Column size="1">1</Column>

			<Column size="static">This column will adapt to it's content</Column>
			<Column size="flex">This column will fill the remaining space</Column>
		</Grid>
	));
