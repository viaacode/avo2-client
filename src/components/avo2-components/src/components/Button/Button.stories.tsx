import React, { Fragment } from 'react';

import { storiesOf } from '@storybook/react';

import { COLORS } from '../../colors';

import { Button } from './Button';

storiesOf('Button', module)
	.addParameters({ jest: ['Button'] })
	.add('Buttons', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button label="Primary button" type="primary" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Secondary button" type="secondary" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Tertiary button" type="tertiary" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Link button" type="link" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger button" type="danger" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger (hover) button" type="danger-hover" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Borderless button" type="borderless" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Disabled button" disabled />
			</div>
		</Fragment>
	))
	.add('Button with icon', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button label="Primary button" type="primary" icon="plus" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Secondary button" type="secondary" icon="search" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Tertiary button" type="tertiary" icon="database" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Link button" type="link" icon="link" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger button" type="danger" icon="x-circle" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger (hover) button" type="danger-hover" icon="x-square" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Borderless button" type="borderless" icon="tag" />
			</div>
		</Fragment>
	))
	.add('Icon only button', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button type="primary" icon="plus" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="secondary" icon="search" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="tertiary" icon="database" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="link" icon="link" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="danger" icon="x-circle" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="danger-hover" icon="x-square" />
			</div>
			<div className="u-spacer-bottom">
				<Button type="borderless" icon="tag" />
			</div>
		</Fragment>
	))
	.add('Button with arrow', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button label="Primary button" type="primary" icon="plus" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Secondary button" type="secondary" icon="search" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Tertiary button" type="tertiary" icon="database" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Link button" type="link" icon="link" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger button" type="danger" icon="x-circle" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger (hover) button" type="danger-hover" icon="x-square" arrow />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Borderless button" type="borderless" icon="tag" arrow />
			</div>
		</Fragment>
	))
	.add('Small buttons', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button label="Primary button" type="primary" icon="plus" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Secondary button" type="secondary" icon="search" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Tertiary button" type="tertiary" icon="database" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Link button" type="link" icon="link" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger button" type="danger" icon="x-circle" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger (hover) button" type="danger-hover" icon="x-square" size="small" />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Borderless button" type="borderless" icon="tag" size="small" />
			</div>
		</Fragment>
	))
	.add('Block buttons', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<Button label="Primary button" type="primary" icon="plus" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Secondary button" type="secondary" icon="search" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Tertiary button" type="tertiary" icon="database" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Link button" type="link" icon="link" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger button" type="danger" icon="x-circle" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Danger (hover) button" type="danger-hover" icon="x-square" block={true} />
			</div>
			<div className="u-spacer-bottom">
				<Button label="Borderless button" type="borderless" icon="tag" block={true} />
			</div>
		</Fragment>
	))
	.add('Inverse buttons', () => (
		<Fragment>
			<div className="u-spacer-bottom">
				<span style={{ padding: '20px', background: COLORS.GRAYSCALE.G800 }}>
					<Button label="Secondary button" type="secondary-i" icon="plus" />
				</span>
			</div>
			<div className="u-spacer-bottom">
				<span style={{ padding: '20px', background: COLORS.GRAYSCALE.G800 }}>
					<Button label="Borderless button" type="borderless-i" icon="search" />
				</span>
			</div>
		</Fragment>
	));
