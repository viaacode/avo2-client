import { shallow } from 'enzyme';
import React, { Fragment } from 'react';

import { Toolbar } from './Toolbar';
import { ToolbarCenter, ToolbarLeft, ToolbarRight } from './Toolbar.slots';

describe('<Toolbar />', () => {
	it('Should be able to render', () => {
		shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
				<ToolbarCenter>
					<Fragment>Center</Fragment>
				</ToolbarCenter>
				<ToolbarRight>
					<Fragment>Right</Fragment>
				</ToolbarRight>
			</Toolbar>
		);
	});

	it('Should set the correct className(s)', () => {
		const toolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
				<ToolbarCenter>
					<Fragment>Center</Fragment>
				</ToolbarCenter>
				<ToolbarRight>
					<Fragment>Right</Fragment>
				</ToolbarRight>
			</Toolbar>
		);

		const mainToolbarDiv = toolbarComponent.find('.c-toolbar');
		const leftControlsDiv = toolbarComponent.find('.c-toolbar__left');
		const centerControlsDiv = toolbarComponent.find('.c-toolbar__center');
		const rightControlsDiv = toolbarComponent.find('.c-toolbar__right');

		expect(mainToolbarDiv).toHaveLength(1);
		expect(leftControlsDiv).toHaveLength(1);
		expect(centerControlsDiv).toHaveLength(1);
		expect(rightControlsDiv).toHaveLength(1);
	});

	it('Should set the correct className for size', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const mediumToolbarComponent = shallow(
			<Toolbar size="medium">
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const mediumToolbarInnerElement = mediumToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar--medium')).toEqual(false);
		expect(mediumToolbarInnerElement.hasClass('c-toolbar--medium')).toEqual(true);
	});

	it('Should set the correct className for spaced', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const spacedToolbarComponent = shallow(
			<Toolbar spaced={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const spacedToolbarInnerElement = spacedToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar--spaced')).toEqual(false);
		expect(spacedToolbarInnerElement.hasClass('c-toolbar--spaced')).toEqual(true);
	});

	it('Should set the correct className for autoHeight', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const autoHeightToolbarComponent = shallow(
			<Toolbar autoHeight={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const autoHeightToolbarInnerElement = autoHeightToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar--auto')).toEqual(false);
		expect(autoHeightToolbarInnerElement.hasClass('c-toolbar--auto')).toEqual(true);
	});

	it('Should set the correct className for alignTop', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const alignTopToolbarComponent = shallow(
			<Toolbar alignTop={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const alignTopToolbarInnerElement = alignTopToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar--align-top')).toEqual(false);
		expect(alignTopToolbarInnerElement.hasClass('c-toolbar--align-top')).toEqual(true);
	});

	it('Should set the correct className for interactiveCenter', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const interactiveCenterToolbarComponent = shallow(
			<Toolbar interactiveCenter={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const interactiveCenterToolbarInnerElement = interactiveCenterToolbarComponent.find(
			'.c-toolbar'
		);

		expect(regularToolbarInnerElement.hasClass('c-toolbar__center--interactive')).toEqual(false);
		expect(interactiveCenterToolbarInnerElement.hasClass('c-toolbar__center--interactive')).toEqual(
			true
		);
	});

	it('Should set the correct className for altCenter', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const altCenterToolbarComponent = shallow(
			<Toolbar altCenter={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const altCenterToolbarInnerElement = altCenterToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar__center-inner--alt')).toEqual(false);
		expect(altCenterToolbarInnerElement.hasClass('c-toolbar__center-inner--alt')).toEqual(true);
	});

	it('Should set the correct className for justified', () => {
		const regularToolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);
		const justifiedToolbarComponent = shallow(
			<Toolbar justified={true}>
				<ToolbarLeft>
					<Fragment>Left</Fragment>
				</ToolbarLeft>
			</Toolbar>
		);

		const regularToolbarInnerElement = regularToolbarComponent.find('.c-toolbar');
		const justifiedToolbarInnerElement = justifiedToolbarComponent.find('.c-toolbar');

		expect(regularToolbarInnerElement.hasClass('c-toolbar__justified')).toEqual(false);
		expect(justifiedToolbarInnerElement.hasClass('c-toolbar__justified')).toEqual(true);
	});

	it('Should correctly render the left controls', () => {
		const toolbarComponent = shallow(
			<Toolbar>
				<ToolbarLeft>
					<p id="test">Hello!</p>
				</ToolbarLeft>
			</Toolbar>
		);

		const children = toolbarComponent.find('#test');

		expect(
			toolbarComponent
				.find('.c-toolbar__left')
				.children()
				.html()
		).toContain(children.html());

		const leftElement = toolbarComponent.find('.c-toolbar__left');
		const centerElement = toolbarComponent.find('.c-toolbar__center');
		const rightElement = toolbarComponent.find('.c-toolbar__right');

		expect(leftElement).toHaveLength(1);
		expect(centerElement).toHaveLength(0);
		expect(rightElement).toHaveLength(0);
	});

	it('Should correctly render the center controls', () => {
		const toolbarComponent = shallow(
			<Toolbar>
				<ToolbarCenter>
					<p id="test">Hello!</p>
				</ToolbarCenter>
			</Toolbar>
		);

		const children = toolbarComponent.find('#test');

		expect(
			toolbarComponent
				.find('.c-toolbar__center')
				.children()
				.html()
		).toContain(children.html());

		const leftElement = toolbarComponent.find('.c-toolbar__left');
		const centerElement = toolbarComponent.find('.c-toolbar__center');
		const rightElement = toolbarComponent.find('.c-toolbar__right');

		expect(leftElement).toHaveLength(0);
		expect(centerElement).toHaveLength(1);
		expect(rightElement).toHaveLength(0);
	});

	it('Should correctly render the right controls', () => {
		const toolbarComponent = shallow(
			<Toolbar>
				<ToolbarRight>
					<p id="test">Hello!</p>
				</ToolbarRight>
			</Toolbar>
		);

		const children = toolbarComponent.find('#test');

		expect(
			toolbarComponent
				.find('.c-toolbar__right')
				.children()
				.html()
		).toContain(children.html());

		const leftElement = toolbarComponent.find('.c-toolbar__left');
		const centerElement = toolbarComponent.find('.c-toolbar__center');
		const rightElement = toolbarComponent.find('.c-toolbar__right');

		expect(leftElement).toHaveLength(0);
		expect(centerElement).toHaveLength(0);
		expect(rightElement).toHaveLength(1);
	});
});
