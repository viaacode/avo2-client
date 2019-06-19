import { shallow } from 'enzyme';
import React from 'react';

import { ModalBackdrop } from './ModalBackdrop';

describe('<ModalBackdrop />', () => {
	it('Should be able to render', () => {
		shallow(<ModalBackdrop />);
	});

	it('Should set the correct className(s)', () => {
		const modalBackdropComponent = shallow(<ModalBackdrop />);

		expect(modalBackdropComponent.hasClass('c-modal-backdrop')).toEqual(true);
		expect(modalBackdropComponent.hasClass('c-modal-backdrop--visible')).toEqual(false);
	});

	it('Should set the correct className when `visible`', () => {
		const modalBackdropComponent = shallow(<ModalBackdrop visible />);

		expect(modalBackdropComponent.hasClass('c-modal-backdrop--visible')).toEqual(true);
	});
});
