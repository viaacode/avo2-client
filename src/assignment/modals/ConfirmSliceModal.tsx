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
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { BLOCK_ITEM_LABELS } from '../../shared/components/BlockList/BlockList.consts';
import { Assignment_v2, AssignmentBlock, AssignmentBlockType } from '../assignment.types';

export interface ConfirmSliceModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
	responses?: Assignment_v2[];
	block?: Pick<AssignmentBlock, 'type'>;
	onConfirm?: () => void;
}

const ConfirmSliceModal: FunctionComponent<ConfirmSliceModalProps> = ({
	responses = [],
	block,
	isOpen,
	onClose,
	onConfirm,
}) => {
	const [t] = useTranslation();

	const label = { type: block ? BLOCK_ITEM_LABELS()[block.type as Avo.Core.BlockItemType] : '' };

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
			case AssignmentBlockType.ITEM:
				return t(
					'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen'
				);
			case AssignmentBlockType.TEXT:
				return t(
					'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-instructie-of-tekstblok-wil-verwijderen'
				);
			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return responses.length > 0 ? (
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
