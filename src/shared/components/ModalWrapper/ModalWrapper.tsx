import React, { FunctionComponent, ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setIsModalOpenAction } from '../../store/actions';

interface ModalWrapperProps {
	isOpen: boolean;
	children: ReactElement;
	setIsModalOpen: (isModalOpen: boolean) => void;
}

/**
 * Provider a wrapper for modals so that the modal-open class is automatically set on body through the redux state
 * @param isOpen
 * @param children
 * @param setIsModalOpen
 * @constructor
 */
const ModalWrapper: FunctionComponent<ModalWrapperProps> = ({
	isOpen,
	children,
	setIsModalOpen,
}) => {
	useEffect(() => {
		setIsModalOpen(isOpen);
	}, [isOpen]);

	return children;
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		setIsModalOpen: (isModalOpen: boolean) => dispatch(setIsModalOpenAction(isModalOpen) as any),
	};
};

export default connect(null, mapDispatchToProps)(ModalWrapper);
