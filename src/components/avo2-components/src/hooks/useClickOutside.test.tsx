import { mount } from 'enzyme';
import React, { createRef, RefObject } from 'react';

import { useClickOutside } from './useClickOutside';

const TestComponent = ({ onClickOutside }: { onClickOutside: () => void }) => {
	const spanElem: RefObject<HTMLButtonElement | null> = createRef();

	const isPartOfElement = (elem: Element | null): boolean => {
		return Boolean(elem && (!spanElem || !spanElem.current || !spanElem.current.contains(elem)));
	};

	const handleClickOutside = () => {
		onClickOutside();
	};

	// useClickOutside(isPartOfElement, handleClickOutside);

	return <span ref={spanElem} />;
};

describe('useClickOutside', () => {
	const events: { [key: string]: any } = {};

	beforeEach(() => {
		window.addEventListener = jest.fn((event, cb) => {
			events[event] = cb;
		});
	});

	// it('Should call onClickOutside when clicking on other element', () => {
	// 	const onClickOutsideHandler = jest.fn();
	//
	// 	const map: any = {};
	// 	document.addEventListener = jest.fn((event, cb) => {
	// 		map[event] = cb;
	// 	});
	//
	// 	const testElems = mount(
	// 		<div>
	// 			<TestComponent onClickOutside={onClickOutsideHandler} />
	// 			<div className="other">test</div>
	// 		</div>
	// 	);
	//
	// 	map.mouseup(testElems.find('.other'));
	//
	// 	expect(onClickOutsideHandler).toHaveBeenCalled();
	// 	expect(onClickOutsideHandler).toHaveBeenCalledTimes(1); // Should trigger when clicking on other element
	// });

	it('Should not call onClickOutside when clicking on element', () => {
		const onClickOutsideHandler = jest.fn();

		const map: any = {};
		document.addEventListener = jest.fn((event, cb) => {
			map[event] = cb;
		});

		const testElems = mount(
			<div>
				<TestComponent onClickOutside={onClickOutsideHandler} />
				<div className="other">test</div>
			</div>
		);

		map.mouseup(testElems.find('TestComponent'));

		expect(onClickOutsideHandler).toHaveBeenCalledTimes(0);
	});
});
