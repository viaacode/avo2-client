import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { Button } from '../Button/Button';

import { Icon } from '../..';
import { Toolbar } from './Toolbar';
import { ToolbarCenter, ToolbarLeft, ToolbarRight } from './Toolbar.slots';
import { ToolbarItem } from './ToolbarItem';
import { ToolbarTitle } from './ToolbarTitle';

storiesOf('Toolbar', module)
	.addParameters({ jest: ['Toolbar', 'ToolbarBackdrop'] })
	.add('Toolbar', () => (
		<Fragment>
			<Toolbar>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<ToolbarTitle>Regular toolbar</ToolbarTitle>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar size="medium">
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar medium</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar spaced={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar spaced</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar autoHeight={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar autoheight</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar alignTop={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar alignTop</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar interactiveCenter={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar interactiveCenter</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar altCenter={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar altCenter</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
			<Toolbar justified={true}>
				<ToolbarLeft>
					<ToolbarItem>
						<Icon name="chevron-left" />
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarCenter>
					<ToolbarItem>
						<p>Toolbar justified</p>
					</ToolbarItem>
				</ToolbarCenter>
				<ToolbarRight>
					<ToolbarItem>
						<Button type="primary" label="Save" />
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
			<br />
		</Fragment>
	))
	.add('Left toolbar', () => (
		<Toolbar>
			<ToolbarLeft>
				<ToolbarItem>
					<Icon name="chevron-left" />
				</ToolbarItem>
			</ToolbarLeft>
		</Toolbar>
	))
	.add('Center toolbar', () => (
		<Toolbar>
			<ToolbarCenter>
				<ToolbarItem>
					<p>Only stuff in the center</p>
				</ToolbarItem>
			</ToolbarCenter>
		</Toolbar>
	))
	.add('Right toolbar', () => (
		<Toolbar>
			<ToolbarRight>
				<ToolbarItem>
					<Button type="primary" label="Only right" />
				</ToolbarItem>
			</ToolbarRight>
		</Toolbar>
	));
