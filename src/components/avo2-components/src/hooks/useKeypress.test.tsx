import { mount } from 'enzyme';
import React from 'react';

import { useKeyPress } from './useKeyPress';

const TestComponent = ({
	onPressDown,
	onPressUp,
}: {
	onPressDown?: () => void;
	onPressUp?: () => void;
}) => {
	useKeyPress('g', onPressDown, onPressUp);

	return null;
};

describe('useKeyPress', () => {
	const events: { [key: string]: any } = {};

	beforeEach(() => {
		window.addEventListener = jest.fn((event, cb) => {
			events[event] = cb;
		});
	});

	it('Should call onPressDown when pressing target key', () => {
		const onPressDownHandler = jest.fn();

		mount(<TestComponent onPressDown={onPressDownHandler} />);

		events.keydown({ key: 'g' });

		expect(onPressDownHandler).toHaveBeenCalled();
		expect(onPressDownHandler).toHaveBeenCalledTimes(1);

		events.keydown({ key: 'g' });

		expect(onPressDownHandler).toHaveBeenCalledTimes(2);
	});

	it('Should call onPressUp when releasing target key', () => {
		const onPressUpHandler = jest.fn();

		mount(<TestComponent onPressUp={onPressUpHandler} />);

		events.keyup({ key: 'g' });

		expect(onPressUpHandler).toHaveBeenCalled();
		expect(onPressUpHandler).toHaveBeenCalledTimes(1);

		events.keyup({ key: 'g' });

		expect(onPressUpHandler).toHaveBeenCalledTimes(2);
	});

	it('Should not call onPressDown when pressing a key that is not the target key', () => {
		const onPressDownHandler = jest.fn();

		mount(<TestComponent onPressDown={onPressDownHandler} />);

		events.keydown({ key: 'a' });

		expect(onPressDownHandler).toHaveBeenCalledTimes(0);
	});

	it('Should not call onPressUp when releasing a key that is not the target key', () => {
		const onPressUpHandler = jest.fn();

		mount(<TestComponent onPressUp={onPressUpHandler} />);

		events.keyup({ key: 'a' });

		expect(onPressUpHandler).toHaveBeenCalledTimes(0);
	});
});
