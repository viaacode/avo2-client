import { shallow } from 'enzyme';
import React from 'react';

import { AvatarIcon } from './AvatarIcon';

describe('<AvatarIcon />', () => {
	it('Should be able to render', () => {
		shallow(<AvatarIcon initials="JD" />);
	});

	it('Should correctly set the className', () => {
		const avatarIconComponent = shallow(<AvatarIcon initials="JD" />);

		expect(avatarIconComponent.hasClass('c-avatar')).toEqual(true);
	});

	it('Should correctly render the initials', () => {
		const initials = 'FB';

		const avatarIconComponent = shallow(<AvatarIcon initials={initials} />);

		expect(avatarIconComponent.text()).toEqual(initials);
	});

	it('Should be able to render as a small avatar', () => {
		const avatarIconComponent = shallow(<AvatarIcon initials="JD" size="small" />);

		expect(avatarIconComponent.hasClass('c-avatar--small')).toEqual(true);
	});

	it('Should be able to render an image as the avatar', () => {
		const image = 'https://api.adorable.io/avatars/128/test';

		const avatarIconComponent = shallow(<AvatarIcon initials="JD" image={image} />);

		const imageElement = avatarIconComponent.find('img');

		expect(imageElement).toHaveLength(1);
		expect(imageElement.prop('src')).toEqual(image);
	});
});
