import { shallow } from 'enzyme';
import React from 'react';

import { Pagination } from './Pagination';

describe('<Pagination />', () => {
	it('Should be able to render', () => {
		shallow(<Pagination pageCount={100} />);
	});

	it('Should set the correct className', () => {
		const paginationComponent = shallow(<Pagination pageCount={100} />);

		expect(paginationComponent.hasClass('c-pagination')).toEqual(true);
	});

	it('Should render pages equal to the `displayCount`', () => {
		const displayCount = 8;

		const paginationComponent = shallow(<Pagination pageCount={100} displayCount={displayCount} />);

		const paginationButtonElements = paginationComponent.find(
			'.c-pagination__pages .c-pagination__btn'
		);

		expect(paginationButtonElements).toHaveLength(displayCount);
	});

	it('Should render pages equal to the `pageCount` if it is less than the `displayCount`', () => {
		const pageCount = 4;
		const displayCount = 8;

		const paginationComponent = shallow(
			<Pagination pageCount={pageCount} displayCount={displayCount} />
		);

		const paginationButtonElements = paginationComponent.find(
			'.c-pagination__pages .c-pagination__btn'
		);

		expect(paginationButtonElements).toHaveLength(pageCount);
	});

	it('Should render the current page in an active state', () => {
		const paginationComponent = shallow(<Pagination pageCount={100} />);

		const currentPageButtonElement = paginationComponent
			.find('.c-pagination__pages .c-pagination__btn')
			.at(0);

		expect(currentPageButtonElement.hasClass('c-pagination__btn--active')).toEqual(true);
	});

	it('Should correctly set the `currentPage`', () => {
		const currentPage = 40;

		const paginationComponent = shallow(<Pagination pageCount={100} currentPage={currentPage} />);

		const currentPageButtonElement = paginationComponent.find('.c-pagination__btn--active');

		expect(parseInt(currentPageButtonElement.text(), 10)).toEqual(currentPage + 1);
	});

	it('Should render pages padded around the current page based on the `displayCount`', () => {
		const currentPage = 50;
		const pagesToRender = [49, 50, 51, 52, 53];

		const paginationComponent = shallow(
			<Pagination pageCount={100} currentPage={currentPage} displayCount={pagesToRender.length} />
		);

		const paginationPagesElement = paginationComponent.find('.c-pagination__pages');

		expect(paginationPagesElement.text()).toEqual(pagesToRender.join(''));
	});

	it('Should render the first x pages when the current page is lower than the (odd) `displayCount`', () => {
		const currentPage = 2;
		const pagesToRender = [1, 2, 3, 4, 5];

		const paginationComponent = shallow(
			<Pagination pageCount={100} currentPage={currentPage} displayCount={pagesToRender.length} />
		);

		const paginationPagesElement = paginationComponent.find('.c-pagination__pages');

		expect(paginationPagesElement.text()).toEqual(pagesToRender.join(''));
	});

	it('Should render the first x pages when the current page is lower than the (even) `displayCount`', () => {
		const currentPage = 1;
		const pagesToRender = [1, 2, 3, 4];

		const paginationComponent = shallow(
			<Pagination pageCount={100} currentPage={currentPage} displayCount={pagesToRender.length} />
		);

		const paginationPagesElement = paginationComponent.find('.c-pagination__pages');

		expect(paginationPagesElement.text()).toEqual(pagesToRender.join(''));
	});

	it('Should render the last x pages when if the currentPage is equal less than the `pageCount` minus the (odd) `displayCount`', () => {
		const currentPage = 97;
		const pagesToRender = [96, 97, 98, 99, 100];

		const paginationComponent = shallow(
			<Pagination pageCount={100} currentPage={currentPage} displayCount={pagesToRender.length} />
		);

		const paginationPagesElement = paginationComponent.find('.c-pagination__pages');

		expect(paginationPagesElement.text()).toEqual(pagesToRender.join(''));
	});

	it('Should render the last x pages when if the currentPage is equal less than the `pageCount` minus the (even) `displayCount`', () => {
		const currentPage = 97;
		const pagesToRender = [97, 98, 99, 100];

		const paginationComponent = shallow(
			<Pagination pageCount={100} currentPage={currentPage} displayCount={pagesToRender.length} />
		);

		const paginationPagesElement = paginationComponent.find('.c-pagination__pages');

		expect(paginationPagesElement.text()).toEqual(pagesToRender.join(''));
	});

	it('Should call `onPageChange` when changing pages internally', () => {
		const onPageChangeHandler = jest.fn();

		const paginationComponent = shallow(
			<Pagination pageCount={100} onPageChange={onPageChangeHandler} />
		);

		const buttonIndex = 2;

		const pageButtonElement = paginationComponent
			.find('.c-pagination__pages .c-pagination__btn')
			.at(buttonIndex);

		pageButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalled();
		expect(onPageChangeHandler).toHaveBeenCalledTimes(1);
		expect(onPageChangeHandler).toHaveBeenCalledWith(buttonIndex);
	});

	it('Should not call `onPageChange` when changing page to the current page', () => {
		const onPageChangeHandler = jest.fn();

		const activeIndex = 2;

		const paginationComponent = shallow(
			<Pagination pageCount={100} onPageChange={onPageChangeHandler} currentPage={activeIndex} />
		);

		const pageButtonElement = paginationComponent
			.find('.c-pagination__pages .c-pagination__btn')
			.at(activeIndex);

		pageButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalledTimes(0);
	});

	it('Should be able to jump to the previous page', () => {
		const onPageChangeHandler = jest.fn();

		const activeIndex = 2;

		const paginationComponent = shallow(
			<Pagination pageCount={100} onPageChange={onPageChangeHandler} currentPage={activeIndex} />
		);

		const previousButtonElement = paginationComponent.find('.c-pagination__btn').at(1);

		previousButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalled();
		expect(onPageChangeHandler).toHaveBeenCalledTimes(1);
		expect(onPageChangeHandler).toHaveBeenCalledWith(activeIndex - 1);
	});

	it('Should be able to jump to the next page', () => {
		const onPageChangeHandler = jest.fn();

		const activeIndex = 2;

		const paginationComponent = shallow(
			<Pagination
				pageCount={100}
				onPageChange={onPageChangeHandler}
				currentPage={activeIndex}
				displayCount={5}
			/>
		);

		const nextButtonElement = paginationComponent.find('.c-pagination__btn').at(7);

		nextButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalled();
		expect(onPageChangeHandler).toHaveBeenCalledTimes(1);
		expect(onPageChangeHandler).toHaveBeenCalledWith(activeIndex + 1);
	});

	it('Should be able to jump to the first page', () => {
		const onPageChangeHandler = jest.fn();

		const activeIndex = 2;

		const paginationComponent = shallow(
			<Pagination pageCount={100} onPageChange={onPageChangeHandler} currentPage={activeIndex} />
		);

		const firstButtonElement = paginationComponent.find('.c-pagination__btn').first();

		firstButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalled();
		expect(onPageChangeHandler).toHaveBeenCalledTimes(1);
		expect(onPageChangeHandler).toHaveBeenCalledWith(0);
	});

	it('Should be able to jump to the last page', () => {
		const pageCount = 100;
		const onPageChangeHandler = jest.fn();

		const activeIndex = 2;

		const paginationComponent = shallow(
			<Pagination pageCount={100} onPageChange={onPageChangeHandler} currentPage={activeIndex} />
		);

		const lastButtonElement = paginationComponent.find('.c-pagination__btn').last();

		lastButtonElement.simulate('click');

		expect(onPageChangeHandler).toHaveBeenCalled();
		expect(onPageChangeHandler).toHaveBeenCalledTimes(1);
		expect(onPageChangeHandler).toHaveBeenCalledWith(pageCount - 1);
	});
});
