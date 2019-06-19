import { shallow } from 'enzyme';
import React from 'react';

import { Icon } from '../Icon/Icon';
import { Blankslate } from './Blankslate';

describe('<Blankslate />', () => {
	it('Should be able to render', () => {
		shallow(
			<Blankslate
				title="This is a blank slate"
				body="Use it to provide information when no dynamic content exists."
			/>
		);
	});

	it('Should set the correct className', () => {
		const blankslateComponent = shallow(
			<Blankslate
				title="This is a blank slate"
				body="Use it to provide information when no dynamic content exists."
			/>
		);

		expect(blankslateComponent.hasClass('c-blankslate')).toEqual(true);
	});

	it('Should set the correct className when in spacious mode', () => {
		const blankslateComponent = shallow(
			<Blankslate
				title="This is a blank slate"
				body="Use it to provide information when no dynamic content exists."
				spacious
			/>
		);

		expect(blankslateComponent.hasClass('c-blankslate--spacious')).toEqual(true);
	});

	it('Should render the title correctly', () => {
		const title = 'This is a test';

		const blankslateComponent = shallow(
			<Blankslate
				title={title}
				body="Use it to provide information when no dynamic content exists."
			/>
		);

		const titleElement = blankslateComponent.find('h4.c-h4');

		expect(titleElement.text()).toEqual(title);
	});

	it('Should render the body correctly', () => {
		const body = 'Lorem ipsum test';

		const blankslateComponent = shallow(<Blankslate title="This is a blank slate" body={body} />);

		const bodyElement = blankslateComponent.find('p.c-body-1');

		expect(bodyElement.text()).toEqual(body);
	});

	it('Should be able to render an icon', () => {
		const iconName = 'database';

		const blankslateComponent = shallow(
			<Blankslate
				title="This is a blank slate"
				body="Use it to provide information when no dynamic content exists."
				icon={iconName}
			/>
		);

		const iconComponent = blankslateComponent.find(Icon);

		expect(iconComponent).toHaveLength(1);
		expect(iconComponent.props()).toMatchObject({ name: iconName, size: 'large' });
	});

	it('Should correctly pass children', () => {
		const blankslateComponent = shallow(
			<Blankslate
				title="This is a blank slate"
				body="Use it to provide information when no dynamic content exists."
			>
				<p id="blankslate-test" />
			</Blankslate>
		);

		const paragraph = blankslateComponent.find('#blankslate-test');

		expect(blankslateComponent.html()).toContain(paragraph.html());
	});
});
