import React, { FunctionComponent } from 'react';

import classNames from 'classnames';

export interface ModalBackdropProps {
	visible?: boolean;
}

export const ModalBackdrop: FunctionComponent<ModalBackdropProps> = ({
	visible = false,
}: ModalBackdropProps) => (
	<div className={classNames('c-modal-backdrop', { 'c-modal-backdrop--visible': visible })} />
);
