import { get } from 'lodash-es';
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
	Select,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { RichEditorState } from '@viaa/avo2-components/dist/esm/wysiwyg';
import { Avo } from '@viaa/avo2-types';

import WYSIWYGWrapper from '../../../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import { CustomError, stripHtml } from '../../../../shared/helpers';
import { ToastService } from '../../../../shared/services';
import { RelationService } from '../../../../shared/services/relation-service/relation.service';
import {
	RelationEntry,
	RelationType,
} from '../../../../shared/services/relation-service/relation.types';
import { ContentPicker } from '../../../shared/components/ContentPicker/ContentPicker';
import { ItemsService } from '../../items.service';

import './DepublishItemModal.scss';

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
			if (
				depublishType === 'depublish_with_reason' &&
				(!reasonHtml || !stripHtml(reasonHtml).trim())
			) {
				ToastService.danger(t('Reden mag niet leeg zijn'), false);
				return;
			}
			if (depublishType === 'depublish_with_replacement' && !replacementExternalId) {
				ToastService.danger(t('Je moet een vervang item selecteren'), false);
				return;
			}

			// Depublish item
			await ItemsService.setItemPublishedState(item.uid, false);

			if (depublishType === 'depublish_with_reason' || depublishType === 'depublish') {
				// Remove references to this item from bookmarks and collections
				await ItemsService.deleteItemFromCollectionsAndBookmarks(
					item.uid,
					item.external_id
				);

				// When we unpublish an item, it cannot be the replacement for any other items
				await RelationService.deleteRelationsByObject(
					'item',
					RelationType.IS_REPLACED_BY,
					item.uid
				);
			}
			if (depublishType === 'depublish_with_reason') {
				await ItemsService.setItemDepublishReason(item.uid, reasonHtml);
			} else if (depublishType === 'depublish_with_replacement' && replacementExternalId) {
				const replacementItem: Avo.Item.Item | null = await ItemsService.fetchItemByExternalId(
					replacementExternalId
				);
				if (!replacementItem) {
					ToastService.danger(
						t('Het bepalen van de id van het vervang item is mislukt'),
						false
					);
					return;
				}

				// Replace items in collection fragments and bookmarks
				await ItemsService.replaceItemInCollectionsAndBookmarks(
					item.uid,
					item.external_id,
					replacementItem.uid,
					replacementItem.external_id
				);

				// Add the replacement as instructed by the user
				await RelationService.insertRelation(
					'item',
					item.uid,
					RelationType.IS_REPLACED_BY,
					replacementItem.uid
				);

				// Reroute replacement chain to new replacement item
				// eg: A => B => C
				// Item A is replaced by B
				// Item B is the current item that we want to replace by item C
				// The final replacement should look like this:
				// A => C
				// B => C
				const itemsReplacedByCurrentItem: RelationEntry[] = await RelationService.fetchRelationsByObject(
					'item',
					RelationType.IS_REPLACED_BY,
					item.uid
				);
				await Promise.all(
					itemsReplacedByCurrentItem.map(async (relation: RelationEntry) => {
						// Remove the old relationship (A => B)
						await RelationService.deleteRelationsBySubject(
							'item',
							relation.subject,
							RelationType.IS_REPLACED_BY
						);
						// Insert new relationship that points to the same replacement item as the current item (A => C)
						await RelationService.insertRelation(
							'item',
							relation.subject,
							RelationType.IS_REPLACED_BY,
							replacementItem.uid
						);
					})
				);
			}
			ToastService.success(t('Het item is gedepubliceerd'), false);
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
			ToastService.danger(t('Het depubliceren is mislukt'), false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			title={t('Item depubliceren')}
			size="medium"
			onClose={handleClose}
			className="m-depublish-modal"
		>
			<ModalBody>
				<Form>
					<FormGroup label={t('Hoe depubliceren?')}>
						<Select
							options={[
								{
									label: t('Enkel depubliceren'),
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
									setReplacementExternalId(get(pickerItem, 'value', null))
								}
								hideTypeDropdown
								hideTargetSwitch
								allowedTypes={['ITEM']}
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
