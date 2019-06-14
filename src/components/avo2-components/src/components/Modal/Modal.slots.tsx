import { FunctionComponent, ReactElement } from 'react';

export interface ModalSlotProps {
	children: ReactElement;
}

export const ModalHeaderRight: FunctionComponent<ModalSlotProps> = ({ children }: ModalSlotProps) =>
	children;

export const ModalBody: FunctionComponent<ModalSlotProps> = ({ children }: ModalSlotProps) =>
	children;

export const ModalFooterRight: FunctionComponent<ModalSlotProps> = ({ children }: ModalSlotProps) =>
	children;

export const ModalFooterLeft: FunctionComponent<ModalSlotProps> = ({ children }: ModalSlotProps) =>
	children;
