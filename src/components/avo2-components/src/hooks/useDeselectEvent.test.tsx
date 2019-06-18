import { mount } from 'enzyme';
import React, { Fragment } from 'react';

import { useDeselectEvent } from './useDeselectEvent';

const TestComponent = ({
	name,
	value,
	onDeselect,
}: {
	name: string;
	value: string;
	onDeselect: () => void;
}) => {
	const [dispatchDeselectEvent] = useDeselectEvent(name, value, onDeselect);

	return <input type="radio" name={name} value={value} onChange={dispatchDeselectEvent} />;
};

describe('useDeselectEvent', () => {
	let wrapper: HTMLElement;

	beforeEach(() => {
		wrapper = document.createElement('div');
		wrapper.setAttribute('id', 'wrapper');

		document.body.appendChild(wrapper);
	});

	it('Should call `onDeselect` when selecting a radio button with the same `name` and a different `value`', () => {
		const onDeselectHandler = jest.fn();

		const component = mount(
			<Fragment>
				<TestComponent name="test" value="1" onDeselect={() => null} />
				<TestComponent name="test" value="2" onDeselect={onDeselectHandler} />
			</Fragment>,
			{ attachTo: wrapper }
		);

		const testElement = component.find('input[type="radio"][value="1"]');
		testElement.simulate('change', { target: { checked: true } });

		expect(onDeselectHandler).toHaveBeenCalledTimes(1);
	});

	it('Should not call `onDeselect` when selecting the current radio button', () => {
		const onDeselectHandler = jest.fn();
		const component = mount(
			<Fragment>
				<TestComponent name="test" value="1" onDeselect={onDeselectHandler} />
				<TestComponent name="test" value="2" onDeselect={() => null} />
			</Fragment>,
			{ attachTo: wrapper }
		);

		const testElement = component.find('input[type="radio"][value="1"]');
		testElement.simulate('change', { target: { checked: true } });

		expect(onDeselectHandler).toHaveBeenCalledTimes(0);
	});

	it('Should not call `onDeselect` when selecting a radio button with a different `name`', () => {
		const onDeselectHandler = jest.fn();

		const component = mount(
			<Fragment>
				<TestComponent name="test" value="1" onDeselect={() => null} />
				<TestComponent name="test-other" value="2" onDeselect={onDeselectHandler} />
			</Fragment>,
			{ attachTo: wrapper }
		);

		const testElement = component.find('input[type="radio"][value="1"]');
		testElement.simulate('change', { target: { checked: true } });

		expect(onDeselectHandler).toHaveBeenCalledTimes(0);
	});
});
