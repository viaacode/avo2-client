import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
	Modal,
	ModalBody,
	ModalFooterRight,
	RichEditorState,
	Select,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import WYSIWYGWrapper from '../../../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import { CustomError } from '../../../../shared/helpers';
import { ToastService } from '../../../../shared/services';
import { RelationService } from '../../../../shared/services/relation-service/relation.service';
import { RelationType } from '../../../../shared/services/relation-service/relation.types';
import { ContentPicker } from '../../../shared/components/ContentPicker/ContentPicker';
import { ItemsService } from '../../items.service';

export type DepublishType = 'depublish' | 'depublish_with_reason' | 'depublish_with_replacement';

interface DepublishItemModalProps {
	item: Avo.Item.Item;
	isOpen: boolean;
	onClose?: () => void;
}

const DepublishItemModal: FunctionComponent<DepublishItemModalProps> = ({
	item,
	onClose = () => {},
	isOpen,
}) => {
	const [t] = useTranslation();

	const [depublishType, setDepublishType] = useState<DepublishType>('depublish');
	const [reason, setReason] = useState<RichEditorState | null>(null);
	const [replacementExternalId, setReplacementExternalId] = useState<string | null>(null);

	const handleClose = () => {
		setDepublishType('depublish');
		setReason(null);
		setReplacementExternalId(null);
		onClose();
	};

	const depublishItem = async () => {
		try {
			const reasonHtml = reason ? reason.toHTML() : '';
			if (depublishType === 'depublish_with_reason' && !reasonHtml) {
				ToastService.danger(t('Reden mag niet leeg zijn'));
				return;
			}
			if (depublishType === 'depublish_with_replacement' && !replacementExternalId) {
				ToastService.danger(t('Je moet een vervangitem selecteren'));
				return;
			}

			await ItemsService.setItemPublishedState(item.external_id, false);
			await ItemsService.deleteItemFromCollectionsAndBookmarks(item.uid, item.external_id);

			if (depublishType === 'depublish_with_reason') {
				await ItemsService.setItemDepublishReason(item.external_id, reasonHtml);
			} else if (depublishType === 'depublish_with_replacement' && replacementExternalId) {
				const replacementItem: Avo.Item.Item | null = await ItemsService.fetchItemByExternalId(
					replacementExternalId
				);
				if (!replacementItem) {
					ToastService.danger(t('Het bepalen van de id van het vervang item is mislukt'));
					return;
				}
				await RelationService.insertRelation(
					'item',
					item.uid,
					replacementItem.uid,
					RelationType.IS_REPLACED_BY
				);
			}
			ToastService.success(t('Het item is gedepubliceerd'));
			handleClose();
		} catch (err) {
			console.error(
				new CustomError('Failed to depublish item', err, {
					item,
					depublishType,
					reason,
					replacementExternalId,
				})
			);
			ToastService.danger(t('Het depubliceren is mislukt'));
		}
	};

	return (
		<Modal isOpen={isOpen} title={t('Item depubliceren')} size="small" onClose={handleClose}>
			<ModalBody>
				<Form>
					<FormGroup label={t('Hoe depubliceren?')}>
						<Select
							options={[
								{
									label: t('Depubliceren'),
									value: 'depublish',
								},
								{
									label: t('Depubliceren met reden'),
									value: 'depublish_with_reason',
								},
								{
									label: t('Depubliceren en vervang item aanduiden'),
									value: 'depublish_with_replacement',
								},
							]}
							value={depublishType}
							onChange={setDepublishType as (value: string) => void}
						/>
					</FormGroup>
					{depublishType === 'depublish_with_reason' && (
						<FormGroup label={t('Reden tot depubliceren:')}>
							<WYSIWYGWrapper
								placeholder={t(
									'Geef een reden waarom dit item gedepubliceerd wordt'
								)}
								state={reason || undefined}
								onChange={setReason}
							/>
						</FormGroup>
					)}
					{depublishType === 'depublish_with_replacement' && (
						<FormGroup label={t('Selecteer item ter vervanging:')}>
							<ContentPicker
								initialValue={
									replacementExternalId
										? {
												type: 'ITEM',
												value: replacementExternalId,
										  }
										: undefined
								}
								onSelect={pickerItem =>
									setReplacementExternalId(pickerItem ? pickerItem.value : null)
								}
								hideTypeDropdown
								hideTargetSwitch
							/>
						</FormGroup>
					)}
				</Form>
			</ModalBody>
			<ModalFooterRight>
				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="secondary"
									label={t(
										'admin/shared/components/change-labels-modal/change-labels-modal___annuleren'
									)}
									onClick={handleClose}
								/>
								<Button
									type="primary"
									label={t('Depubliceer')}
									onClick={depublishItem}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalFooterRight>
		</Modal>
	);
};

export default DepublishItemModal;
