import { shallow } from 'enzyme';
import React from 'react';

import { Image } from './Image';

describe('<Image />', () => {
	it('Should be able to render', () => {
		shallow(<Image src="https://source.unsplash.com/random" />);
	});

	it('Should set the correct className', () => {
		const imageComponent = shallow(<Image src="https://source.unsplash.com/random" />);

		expect(imageComponent.hasClass('c-image')).toEqual(true);
		expect(imageComponent.hasClass('c-image--full-width')).toEqual(false);
	});

	it('Should set the correct className in wide mode', () => {
		const imageComponent = shallow(<Image src="https://source.unsplash.com/random" wide />);

		expect(imageComponent.hasClass('c-image--full-width')).toEqual(true);
	});

	it('Should correctly pass on `src` and `alt` to the <img>', () => {
		const src = 'https://source.unsplash.com/random';
		const alt = 'a random image';

		const imageComponent = shallow(<Image src={src} alt={alt} />);

		const imageElement = imageComponent.find('img');

		expect(imageElement.prop('src')).toEqual(src);
		expect(imageElement.prop('alt')).toEqual(alt);
	});
});
