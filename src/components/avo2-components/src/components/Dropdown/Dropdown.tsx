import React, { FunctionComponent, ReactNode, useState } from 'react';

import classNames from 'classnames';
import { get } from 'lodash-es';
import PopperJS, { Data, ModifierFn } from 'popper.js';
import { Manager, Popper, Reference } from 'react-popper';

import { useCallbackRef } from '../../hooks/useCallbackRef';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyPress } from '../../hooks/useKeyPress';

import { Icon } from '../Icon/Icon';

export interface DropdownProps {
	label: string;
	isOpen: boolean;
	placement?:
		| 'auto'
		| 'auto-start'
		| 'auto-end'
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end';
	autoSize?: boolean;
	children: ReactNode;
	onOpen?: () => void;
	onClose?: () => void;
}

/**
 * This component provides a button that can show a flyout with some children inside of it.
 * The PopperJS library is used to provide the positioning logic for the flyout element.
 *
 * The nomenclature within this library is as follows:
 * - The button with down arrow is called the "reference"
 * - The flyout element that contains the children is called the "popper"
 */
export const Dropdown: FunctionComponent<DropdownProps> = ({
	label,
	isOpen,
	placement = 'bottom-start',
	autoSize = false,
	children,
	onOpen = () => {},
	onClose = () => {},
}: DropdownProps) => {
	const [dropdownFlyout, dropdownFlyoutRef] = useCallbackRef();
	const [dropdownButton, dropdownButtonRef] = useCallbackRef();

	const toggle = (openState: boolean = !isOpen) => {
		if (openState !== isOpen) {
			openState ? onOpen() : onClose();
		}
	};

	const toggleClosed = () => toggle(false);

	// We let popper calculate all the required styles, then we modify them a little based on the `autoSize` settings
	const computeStyle = (data: Data, options: Object) => {
		const computeStylesFn: ModifierFn = get(PopperJS, 'Defaults.modifiers.computeStyle.fn');

		const newData = computeStylesFn(data, options);

		if (!autoSize) {
			// Make the width of the popper the same size as the reference element
			newData.styles.width = `${newData.offsets.reference.width}px`;
		}

		newData.styles.overflow = 'hidden';

		return newData;
	};

	const modifiers = {
		computeStyle: {
			fn: computeStyle,
		},
	};

	useKeyPress('Escape', toggleClosed);
	useClickOutside(dropdownFlyout, toggleClosed, [dropdownButton]);

	return (
		<Manager>
			<Reference innerRef={dropdownButtonRef}>
				{({ ref }) => (
					<button className="c-button c-button--secondary" ref={ref} onClick={() => toggle()}>
						<div className="c-button__content">
							<div className="c-button__label">{label}</div>
							<Icon name={isOpen ? 'caret-up' : 'caret-down'} size="small" type="arrows" />
						</div>
					</button>
				)}
			</Reference>
			<Popper placement={placement} modifiers={modifiers} innerRef={dropdownFlyoutRef}>
				{({ ref, style, placement }) => (
					<div
						className={classNames('c-menu', {
							'c-menu--visible': isOpen,
						})}
						ref={ref}
						data-placement={placement}
						style={style}
					>
						{children}
					</div>
				)}
			</Popper>
		</Manager>
	);
};
