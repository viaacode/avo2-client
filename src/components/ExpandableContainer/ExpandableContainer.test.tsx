import { mount, shallow } from 'enzyme';
import React, { Fragment } from 'react';

import { ExpandableContainer } from './ExpandableContainer';

describe('<Container />', () => {
	it('Should be able to render', () => {
		shallow(
			<ExpandableContainer>
				<Fragment />
			</ExpandableContainer>
		);
	});

	it('Should set the correct collapsed height', () => {
		const height = 40;

		const containerComponent = shallow(
			<ExpandableContainer collapsedHeight={height}>
				<Fragment />
			</ExpandableContainer>
		);

		const textContentDiv = containerComponent.find('div').get(0);

		expect((textContentDiv.props.style || {}).height).toEqual(`${height}px`);
	});

	it('Should render with custom expand/collapse labels', () => {
		const collapsedLabel = 'less';
		const expandLabel = 'more';

		const containerComponent = mount(
			<ExpandableContainer collapseLabel={collapsedLabel} expandLabel={expandLabel}>
				<Fragment />
			</ExpandableContainer>
		);

		const button = containerComponent.find('.c-button');
		const buttonLabel = containerComponent.find('.c-button__label');

		expect(buttonLabel.html()).toContain(`>${expandLabel}<`);

		button.simulate('click');

		expect(buttonLabel.html()).toContain(`>${collapsedLabel}<`);
	});

	it('Should render expanded state if defaultExpanded is true', () => {
		const containerComponent = mount(
			<ExpandableContainer defaultExpanded={true}>
				<Fragment />
			</ExpandableContainer>
		);

		const button = containerComponent.find('.c-button');
		const buttonLabel = containerComponent.find('.c-button__label');

		expect(buttonLabel.html()).toContain(`>Minder lezen<`);

		button.simulate('click');

		expect(buttonLabel.html()).toContain(`>Meer lezen<`);
	});
});
