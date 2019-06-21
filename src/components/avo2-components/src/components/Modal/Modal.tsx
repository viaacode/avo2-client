import React, { Fragment, FunctionComponent, MouseEvent, ReactNode } from 'react';

import classNames from 'classnames';
import ReactDOM from 'react-dom';

import { useKeyPress } from '../../hooks/useKeyPress';
import { useSlot } from '../../hooks/useSlot';

import { Button } from '../Button/Button';

import { ModalBody, ModalFooterLeft, ModalFooterRight, ModalHeaderRight } from './Modal.slots';
import { ModalBackdrop } from './ModalBackdrop';

export interface ModalProps {
	children: ReactNode;
	isOpen: boolean;
	title?: string;
	size?: 'small' | 'medium' | 'large' | 'fullscreen' | 'fullwidth' | 'auto';
	scrollable?: boolean;
	onClose?: () => void;
}

export const Modal: FunctionComponent<ModalProps> = ({
	children,
	isOpen,
	title,
	size,
	scrollable,
	onClose = () => {},
}: ModalProps) => {
	const body = useSlot(ModalBody, children);
	const headerRight = useSlot(ModalHeaderRight, children);
	const footerRight = useSlot(ModalFooterRight, children);
	const footerLeft = useSlot(ModalFooterLeft, children);

	useKeyPress('Escape', close);

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
						'c-modal--large': size === 'large',
						'c-modal--fullscreen': size === 'fullscreen',
						'c-modal--fullwidth': size === 'fullwidth',
						'c-modal--height-auto': size === 'auto',
						'c-modal--scrollable': scrollable,
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
