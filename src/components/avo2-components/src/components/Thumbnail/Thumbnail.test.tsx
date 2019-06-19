import { shallow } from 'enzyme';
import React from 'react';

import { Thumbnail } from './Thumbnail';

describe('<Thumbnail />', () => {
	it('Should be able to render', () => {
		shallow(
			<Thumbnail
				src="images/thumbnail.jpg"
				meta="4 items"
				category="collection"
				label="collectie"
			/>
		);
	});

	it('Should set the correct className', () => {
		const thumbnailComponent = shallow(
			<Thumbnail
				src="images/thumbnail.jpg"
				meta="4 items"
				category="collection"
				label="collectie"
			/>
		);

		expect(thumbnailComponent.hasClass('c-thumbnail')).toEqual(true);
	});

	it('Should render image if src was given', () => {
		const thumbnailComponent = shallow(
			<Thumbnail
				src="images/thumbnail.jpg"
				meta="4 items"
				category="collection"
				label="collectie"
			/>
		);

		const imageContainer = thumbnailComponent.find('.c-thumbnail-image');
		expect(imageContainer).toHaveLength(1);

		const imageElement = imageContainer.find('img');
		expect(imageElement.prop('src')).toEqual('images/thumbnail.jpg');
	});

	it('Should render placeholder if no src was given', () => {
		const thumbnailComponent = shallow(
			<Thumbnail meta="4 items" category="collection" label="collectie" />
		);

		const imageContainer = thumbnailComponent.find('.c-thumbnail-image');
		expect(imageContainer).toHaveLength(0);

		const placeholderElement = thumbnailComponent.find('.c-thumbnail-placeholder');
		expect(placeholderElement).toHaveLength(1);
	});
});
