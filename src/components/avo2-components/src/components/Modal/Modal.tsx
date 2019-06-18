import React, {
	Fragment,
	FunctionComponent,
	MouseEvent,
	ReactElement,
	ReactNode,
	ReactNodeArray,
} from 'react';

import classNames from 'classnames';
import ReactDOM from 'react-dom';

import { useKeyPress } from '../../hooks/useKeyPress';

import { Button } from '../Button/Button';

import {
	ModalBody,
	ModalFooterLeft,
	ModalFooterRight,
	ModalHeaderRight,
	ModalSlotProps,
} from './Modal.slots';
import { ModalBackdrop } from './ModalBackdrop';

export interface ModalProps {
	children: ReactNode;
	isOpen: boolean;
	title?: string;
	size?: 'small' | 'medium' | 'large' | 'fullscreen' | 'auto';
	onClose?: () => void;
}

export const Modal: FunctionComponent<ModalProps> = ({
	children,
	isOpen,
	title,
	size,
	onClose = () => {},
}: ModalProps) => {
	const body = getSlot(ModalBody);
	const headerRight = getSlot(ModalHeaderRight);
	const footerRight = getSlot(ModalFooterRight);
	const footerLeft = getSlot(ModalFooterLeft);

	useKeyPress('Escape', close);

	function getSlot(type: FunctionComponent<ModalSlotProps>) {
		const slots: ReactNodeArray = Array.isArray(children) ? children : [children];
		const element: ReactElement = slots.find((c: any) => c.type === type) as ReactElement;

		if (element && element.props.children) {
			return element.props.children;
		}

		return null;
	}

	function close() {
		onClose();
	}

	function onContextClick(event: MouseEvent<HTMLElement>) {
		// close the modal when clicking outside the modal
		if (event.target === event.currentTarget) {
			close();
		}
	}

	return ReactDOM.createPortal(
		<Fragment>
			<div
				className={classNames('c-modal-context', { 'c-modal-context--visible': isOpen })}
				onClick={onContextClick}
			>
				<div
					className={classNames('c-modal', {
						'c-modal--small': size === 'small',
						'c-modal--medium': size === 'medium',
						'c-modal--fullscreen': size === 'fullscreen',
						'c-modal--height-auto': size === 'auto',
					})}
				>
					<div className="c-modal__header c-modal__header--bordered">
						<div className="c-toolbar c-toolbar--spaced">
							{title && (
								<div className="c-toolbar__left">
									<div className="c-toolbar__item">
										<h2 className="c-modal__title">{title}</h2>
									</div>
								</div>
							)}
							<div className="c-toolbar__right">
								{headerRight && <div className="c-toolbar__item">{headerRight}</div>}
								<div className="c-toolbar__item">
									<Button onClick={close} icon="close" type="borderless" />
								</div>
							</div>
						</div>
					</div>
					<div className="c-modal__body">{body}</div>
					{(footerLeft || footerRight) && (
						<div className="c-modal__footer c-modal__footer--bordered">
							<div className="c-toolbar c-toolbar--spaced">
								{footerLeft && (
									<div className="c-toolbar__left">
										<div className="c-toolbar__item">
											<div className="c-button-toolbar">{footerLeft}</div>
										</div>
									</div>
								)}
								{footerRight && (
									<div className="c-toolbar__right">
										<div className="c-toolbar__item">
											<div className="c-button-toolbar">{footerRight}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
			<ModalBackdrop visible={isOpen} />
		</Fragment>,
		document.body
	);
};
