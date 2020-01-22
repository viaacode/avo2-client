import { shallow } from 'enzyme';
import React from 'react';

import { TopBar } from './TopBar';

describe('<TopBar />', () => {
	const topBarComponent = shallow(
		<TopBar showBackButton history={{} as any} location={{} as any} match={{} as any} />
	);

	it('Should be able to render', () => {
		shallow(<TopBar showBackButton history={{} as any} location={{} as any} match={{} as any} />);
	});

	it('Should set the correct className', () => {
		console.log(`topbar html: ${topBarComponent.html()}`);
		expect(topBarComponent.hasClass('c-top-bar')).toBeTruthy();
	});

	it('Should render a back button based on `showBackButton` prop', () => {
		expect(topBarComponent.find('.c-top-bar__back')).toHaveLength(1);

		topBarComponent.setProps({ showBackButton: false });
		expect(topBarComponent.find('.c-top-bar__back')).toHaveLength(0);
	});
});
