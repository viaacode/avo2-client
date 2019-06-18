import { shallow } from 'enzyme';
import React from 'react';

import { Icon } from '../Icon/Icon';

import { TagList } from './TagList';

const tags = [
	'Aluminium',
	'Cadmium',
	'Dubnium',
	'Potassium',
	'Vanadium',
	'Palladium',
	'Polonium',
	'Rhodium',
	'Yttrium',
	'Uranium',
];

describe('<TagList />', () => {
	it('Should be able to render', () => {
		shallow(<TagList tags={tags} />);
	});

	it('Should set the correct className', () => {
		const tagListComponent = shallow(<TagList tags={tags} />);

		expect(tagListComponent.hasClass('c-tag-list')).toEqual(true);
	});

	it('Should correctly render the labels', () => {
		const tagListComponent = shallow(<TagList tags={tags} />);

		expect(
			tagListComponent
				.find('.c-label-text')
				.at(0)
				.text()
		).toEqual(tags[0]);
	});

	it('Should be able to render with swatches', () => {
		const tagListComponent = shallow(<TagList tags={tags} swatches={true} />);

		const tagElements = tagListComponent.find('.c-label-swatch');

		expect(tagElements).toHaveLength(tags.length);
	});

	it('Should be able to render without swatches', () => {
		const tagListComponent = shallow(<TagList tags={tags} swatches={false} />);

		const tagElements = tagListComponent.find('.c-label-swatch');

		expect(tagElements).toHaveLength(0);
	});

	it('Should set the correct className for labels when rendering with swatches', () => {
		const tagListComponent = shallow(<TagList tags={tags} swatches={true} />);

		expect(tagListComponent.find('.c-label-text')).toHaveLength(tags.length);
		expect(tagListComponent.find('.c-tag__label')).toHaveLength(0);
	});

	it('Should set the correct className for labels when rendering without swatches', () => {
		const tagListComponent = shallow(<TagList tags={tags} swatches={false} />);

		expect(tagListComponent.find('.c-label-text')).toHaveLength(0);
		expect(tagListComponent.find('.c-tag__label')).toHaveLength(tags.length);
	});

	it('Should be able to render with borders', () => {
		const tagListComponent = shallow(<TagList tags={tags} />);

		const tagElements = tagListComponent.find('.c-tag');

		expect(tagElements).toHaveLength(tags.length);
	});

	it('Should be able to render without borders', () => {
		const tagListComponent = shallow(<TagList tags={tags} bordered={false} />);

		const tagElements = tagListComponent.find('.c-label');

		expect(tagElements).toHaveLength(tags.length);
	});

	it('Should be able to render close buttons', () => {
		const tagListComponent = shallow(<TagList tags={tags} closable />);

		const closeTagIconComponents = tagListComponent.find(Icon);

		expect(closeTagIconComponents).toHaveLength(tags.length);
	});

	it('Should call `onTagClosed` when closing a tag', () => {
		const onTagClosedHandler = jest.fn();

		const tagListComponent = shallow(
			<TagList tags={tags} closable onTagClosed={onTagClosedHandler} />
		);

		const closeTagElements = tagListComponent.find('a');

		const indexToClose = 5;
		// close the 6th element in the list
		closeTagElements.at(indexToClose).simulate('click');

		expect(onTagClosedHandler).toHaveBeenCalled();
		expect(onTagClosedHandler).toHaveBeenCalledTimes(1);
		expect(onTagClosedHandler).toHaveBeenCalledWith(tags[indexToClose]);
	});
});
