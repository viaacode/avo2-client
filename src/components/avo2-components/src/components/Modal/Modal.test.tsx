import { mount, shallow } from 'enzyme';
import React, { Fragment } from 'react';

import { Modal } from './Modal';
import { ModalBody, ModalFooterLeft, ModalFooterRight, ModalHeaderRight } from './Modal.slots';
import { ModalBackdrop } from './ModalBackdrop';

describe('<Modal />', () => {
	it('Should be able to render', () => {
		shallow(
			<Modal isOpen={false}>
				<Fragment />
			</Modal>
		);
	});

	it('Should set the correct className(s)', () => {
		const modalComponent = shallow(
			<Modal isOpen={false}>
				<Fragment />
			</Modal>
		);

		const modalWrapperElement = modalComponent.childAt(0);
		const modalInnerElement = modalWrapperElement.childAt(0);

		expect(modalWrapperElement).toHaveLength(1);
		expect(modalWrapperElement.hasClass('c-modal-context')).toEqual(true);
		expect(modalInnerElement).toHaveLength(1);
		expect(modalInnerElement.hasClass('c-modal')).toEqual(true);
	});

	it('Should set the correct className for every size', () => {
		const smallModalComponent = shallow(
			<Modal isOpen={false} size="small">
				<Fragment />
			</Modal>
		);

		const mediumModalComponent = shallow(
			<Modal isOpen={false} size="medium">
				<Fragment />
			</Modal>
		);

		const fullscreenModalComponent = shallow(
			<Modal isOpen={false} size="fullscreen">
				<Fragment />
			</Modal>
		);

		const autoSizeModalComponent = shallow(
			<Modal isOpen={false} size="auto">
				<Fragment />
			</Modal>
		);

		const smallModalInnerElement = smallModalComponent.find('.c-modal');
		const mediumModalInnerElement = mediumModalComponent.find('.c-modal');
		const fullscreenModalInnerElement = fullscreenModalComponent.find('.c-modal');
		const autoSizeModalModalInnerElement = autoSizeModalComponent.find('.c-modal');

		expect(smallModalInnerElement.hasClass('c-modal--small')).toEqual(true);
		expect(mediumModalInnerElement.hasClass('c-modal--medium')).toEqual(true);
		expect(fullscreenModalInnerElement.hasClass('c-modal--fullscreen')).toEqual(true);
		expect(autoSizeModalModalInnerElement.hasClass('c-modal--height-auto')).toEqual(true);
	});

	it('Should be able to render with a title', () => {
		const title = 'Modal test';

		const modalComponent = shallow(
			<Modal isOpen={false} title={title}>
				<Fragment />
			</Modal>
		);

		const titleElement = modalComponent.find('.c-modal__title');

		expect(titleElement.text()).toEqual(title);
	});

	it('Should be able to render without a title', () => {
		const modalComponent = shallow(
			<Modal isOpen={false}>
				<Fragment />
			</Modal>
		);

		const titleElement = modalComponent.find('.c-modal__title');

		expect(titleElement).toHaveLength(0);
	});

	it('Should be able to be rendered invisible', () => {
		const modalComponent = shallow(
			<Modal isOpen={false}>
				<Fragment />
			</Modal>
		);

		const modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(false);
	});

	it('Should be able to be rendered visible ', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<Fragment />
			</Modal>
		);

		const modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(true);
	});

	it('Should not show the backdrop when invisible', () => {
		const modalComponent = shallow(
			<Modal isOpen={false}>
				<Fragment />
			</Modal>
		);

		const modalBackdropComponent = modalComponent.find(ModalBackdrop);

		expect(modalBackdropComponent.prop('visible')).toEqual(false);
	});

	it('Should show the backdrop when visible', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<Fragment />
			</Modal>
		);

		const modalBackdropComponent = modalComponent.find(ModalBackdrop);

		expect(modalBackdropComponent.prop('visible')).toEqual(true);
	});

	it('Should close when clicking around the modal ', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<Fragment />
			</Modal>
		);

		let modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(true);

		modalWrapperElement.simulate('click', {
			target: '.c-modal-context',
			currentTarget: '.c-modal-context',
		});

		modalComponent.update();
		modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(false);
	});

	it('Should not close when clicking inside the modal ', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<Fragment />
			</Modal>
		);

		let modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(true);

		modalWrapperElement.simulate('click', {
			target: '.c-modal',
			currentTarget: '.c-modal-context',
		});

		modalComponent.update();
		modalWrapperElement = modalComponent.childAt(0);

		expect(modalWrapperElement.hasClass('c-modal-context--visible')).toEqual(true);
	});

	it('Should call the onClose handler when closing the modal', () => {
		const onCloseHandler = jest.fn();

		const modalComponent = shallow(
			<Modal isOpen={true} onClose={onCloseHandler}>
				<Fragment />
			</Modal>
		);

		const modalWrapperElement = modalComponent.childAt(0);

		modalWrapperElement.simulate('click', {
			target: '.c-modal-context',
			currentTarget: '.c-modal-context',
		});

		expect(onCloseHandler).toHaveBeenCalled();
		expect(onCloseHandler).toHaveBeenCalledTimes(1);
	});

	it('Should correctly render the body', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalBody>
					<p id="test">Hello!</p>
				</ModalBody>
			</Modal>
		);

		const children = modalComponent.find('#test');

		expect(
			modalComponent
				.find('.c-modal__body')
				.children()
				.html()
		).toEqual(children.html());
	});

	it('Should be able to render items in the header (right)', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalHeaderRight>
					<p>Test (right)</p>
				</ModalHeaderRight>
			</Modal>
		);

		const headerRightElement = modalComponent.find(
			'.c-modal__header .c-toolbar__right .c-toolbar__item'
		);

		expect(
			headerRightElement
				.at(0)
				.children()
				.html()
		).toEqual('<p>Test (right)</p>');
	});

	it('Should be able to render items in the footer (left)', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalFooterLeft>
					<p>Test (left)</p>
				</ModalFooterLeft>
			</Modal>
		);

		const footerLeftElement = modalComponent.find(
			'.c-modal__footer .c-toolbar__left .c-button-toolbar'
		);

		expect(footerLeftElement).toHaveLength(1);
		expect(footerLeftElement.children().html()).toEqual('<p>Test (left)</p>');
	});

	it('Should be able to render items in the footer (right)', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalFooterRight>
					<p>Test (right)</p>
				</ModalFooterRight>
			</Modal>
		);

		const footerRightElement = modalComponent.find(
			'.c-modal__footer .c-toolbar__right .c-button-toolbar'
		);

		expect(footerRightElement).toHaveLength(1);
		expect(footerRightElement.children().html()).toEqual('<p>Test (right)</p>');
	});

	it('Should not render the footer when no footer render props are passed', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<Fragment />
			</Modal>
		);

		const footerElement = modalComponent.find('.c-modal__footer');

		expect(footerElement).toHaveLength(0);
	});

	it('Should not render the left side of the footer when no ModalFooterLeft-slot is passed', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalFooterRight>
					<div />
				</ModalFooterRight>
			</Modal>
		);

		const footerLeftElement = modalComponent.find('.c-modal__footer .c-toolbar__left');

		expect(footerLeftElement).toHaveLength(0);
	});

	it('Should not render the right side of the footer when no ModalFooterRight-slot is passed', () => {
		const modalComponent = shallow(
			<Modal isOpen={true}>
				<ModalFooterLeft>
					<div />
				</ModalFooterLeft>
			</Modal>
		);

		const footerLeftElement = modalComponent.find('.c-modal__footer .c-toolbar__right');

		expect(footerLeftElement).toHaveLength(0);
	});
});
