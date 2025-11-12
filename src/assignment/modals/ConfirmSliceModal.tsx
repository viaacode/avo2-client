import {Button, ButtonToolbar, Modal, ModalBody, type ModalProps, Spacer, Toolbar, ToolbarItem, ToolbarRight,} from '@viaa/avo2-components';
import {Avo} from '@viaa/avo2-types';
import React, {type FC} from 'react';

import {BLOCK_ITEM_LABELS} from '../../shared/components/BlockList/BlockList.consts.js';
import {tHtml} from '../../shared/helpers/translate-html.js';
import {tText} from '../../shared/helpers/translate-text.js';

export interface ConfirmSliceModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
	responses?: Avo.Assignment.Response[];
	block?: Pick<Avo.Assignment.Block, 'type'>;
	isPupilCollection: boolean;
	onConfirm?: () => void;
}

export const ConfirmSliceModal: FC<ConfirmSliceModalProps> = ({
	responses = [],
	block,
	isPupilCollection,
	isOpen,
	onClose,
	onConfirm,
}) => {
	const label = {
		type: block
			? BLOCK_ITEM_LABELS(isPupilCollection)[block.type as Avo.Core.BlockItemType]
			: '',
	};

	const renderConfirmButtons = () => {
		return (
			<Toolbar spaced>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={tText('assignment/modals/confirm-slice___annuleer')}
								onClick={onClose}
							/>
							<Button
								type="danger"
								label={tText('assignment/modals/confirm-slice___verwijder')}
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
			case Avo.Core.BlockItemType.ITEM:
				return tHtml(
					'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen'
				);
			case Avo.Core.BlockItemType.TEXT:
				return isPupilCollection
					? tHtml(
							'assignment/modals/confirm-slice-modal___ben-je-zeker-dat-je-dit-tekstblok-wil-verwijderen'
					  )
					: tHtml(
							'assignment/modals/confirm-slice___ben-je-zeker-dat-je-dit-instructie-of-tekstblok-wil-verwijderen'
					  );
			case Avo.Core.BlockItemType.ZOEK:
			case Avo.Core.BlockItemType.BOUW:
				return responses.length > 0 ? (
					<>
						<b>{tHtml('assignment/modals/confirm-slice___opgelet')}: </b>
						{tHtml(
							'assignment/modals/confirm-slice___opgelet-er-bestaan-reeds-leerlingencollecties-voor-deze-zoekopdracht-ben-je-zeker-dat-je-de-zoekoefening-en-leerlingencollecties-wil-verwijderen'
						)}
					</>
				) : (
					tText(
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
			title={tHtml('assignment/modals/confirm-slice___type-verwijderen', label)}
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
