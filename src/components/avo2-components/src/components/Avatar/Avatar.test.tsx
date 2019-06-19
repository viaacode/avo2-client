import { shallow } from 'enzyme';
import React from 'react';

import { Avatar } from './Avatar';
import { AvatarIcon } from './AvatarIcon';

describe('<Avatar />', () => {
	it('Should be able to render', () => {
		shallow(<Avatar initials="JD" name="John Doe" />);
	});

	it('Should correctly render the name', () => {
		const name = 'Jane Doe';

		const avatarComponent = shallow(<Avatar initials="JD" name={name} />);

		const nameElement = avatarComponent.find('p');

		expect(nameElement).toHaveLength(1);
		expect(nameElement.text()).toEqual(name);
	});

	it('Should correctly render the title', () => {
		const title = 'Chief Executive Officer';

		const avatarComponent = shallow(<Avatar initials="JD" title={title} />);

		const titleElement = avatarComponent.find('.u-text-muted');

		expect(titleElement.text()).toEqual(title);
	});

	it('Should correctly render a combination of the name & title', () => {
		const name = 'Jane Doe';
		const title = 'Chief Executive Officer';

		const avatarComponent = shallow(<Avatar initials="JD" name={name} title={title} />);

		const nameElement = avatarComponent.find('p').first();
		const titleElement = avatarComponent.find('.u-text-muted');

		expect(avatarComponent.hasClass('c-avatar-and-text')).toEqual(true);
		expect(nameElement.text()).toEqual(name);
		expect(titleElement.text()).toEqual(title);
	});

	it('Should render only the icon when no name or title was passed', () => {
		const avatarComponent = shallow(<Avatar initials="JD" />);

		const avatarIconComponent = avatarComponent.find(AvatarIcon);
		expect(avatarIconComponent).toHaveLength(1);
		expect(avatarComponent.html()).toEqual(avatarIconComponent.html());
	});

	it('Should correctly pass the necessary props to <AvatarIcon />', () => {
		const initials = 'JD';
		const size = 'small';
		const image = 'https://api.adorable.io/avatars/128/test';

		const avatarComponent = shallow(<Avatar initials={initials} size={size} image={image} />);
		const avatarIconComponent = avatarComponent.find(AvatarIcon);

		expect(avatarComponent.props()).toMatchObject(avatarIconComponent.props());
	});
});
