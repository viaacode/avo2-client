import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	ModalProps,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';

import { EDIT_ASSIGNMENT_BLOCK_LABELS } from '../assignment.const';

interface ConfirmSliceModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
	assignment: Avo.Assignment.Assignment_v2;
	block?: Pick<AssignmentBlock, 'type'>;
	onConfirm?: () => void;
}

const ConfirmSliceModal: FunctionComponent<ConfirmSliceModalProps> = ({
	assignment,
	block,
	isOpen,
	onClose,
	onConfirm,
}) => {
	const [t] = useTranslation();

	const label = { type: block ? EDIT_ASSIGNMENT_BLOCK_LABELS(t)[block.type] : '' };

	const renderConfirmButtons = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={t('assignment/modals/confirm-slice___annuleer')}
								onClick={onClose}
							/>
							<Button
								type="danger"
								label={t('assignment/modals/confirm-slice___verwijder')}
								onClick={onConfirm}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		);
	};

	const renderModalBody = () => {
		switch (block?.type) {
			case 'ITEM':
				return t(
					'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen'
				);
			case 'TEXT':
				return t(
					'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-instructie-of-tekstblok-wil-verwijderen'
				);
			case 'ZOEK':
				return assignment.responses.length > 0 ? (
					<>
						<b>{t('assignment/modals/confirm-slice___opgelet')}: </b>
						{t(
							'assignment/modals/confirm-slice___opgelet-er-bestaan-reeds-leerlingencollecties-voor-deze-zoekopdracht-ben-je-zeker-dat-je-de-zoekoefening-en-leerlingencollecties-wil-verwijderen'
						)}
					</>
				) : (
					t(
						'assignment/modals/confirm-slice___ben-je-zeker-dat-je-de-zoekoefening-wil-verwijderen'
					)
				);

			default:
				return null;
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t('assignment/modals/confirm-slice___type-verwijderen', label)}
			size="medium"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>
				<Spacer margin={['bottom']}>{renderModalBody()}</Spacer>
				{renderConfirmButtons()}
			</ModalBody>
		</Modal>
	);
};

export default ConfirmSliceModal;