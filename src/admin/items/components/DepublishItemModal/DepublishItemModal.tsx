import { type RichEditorState } from '@meemoo/react-components';
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
import { type Avo } from '@viaa/avo2-types';
import { get, noop } from 'lodash-es';
import React, { type FC, useState } from 'react';

import { RichTextEditorWrapper } from '../../../../shared/components/RichTextEditorWrapper/RichTextEditorWrapper';
import { Lookup_Enum_Relation_Types_Enum } from '../../../../shared/generated/graphql-db-types';
import { CustomError } from '../../../../shared/helpers/custom-error';
import { stripHtml } from '../../../../shared/helpers/formatters/strip-html';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { tText } from '../../../../shared/helpers/translate-text';
import { RelationService } from '../../../../shared/services/relation-service/relation.service';
import { ToastService } from '../../../../shared/services/toast-service';
import { ContentPicker } from '../../../shared/components/ContentPicker/ContentPicker';
import { ItemsService } from '../../items.service';

import './DepublishItemModal.scss';

type DepublishType = 'depublish' | 'depublish_with_reason' | 'depublish_with_replacement';

interface DepublishItemModalProps {
	item: Avo.Item.Item;
	isOpen: boolean;
	onClose?: () => void;
}

export const DepublishItemModal: FC<DepublishItemModalProps> = ({
	item,
	onClose = noop,
	isOpen,
}) => {
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
				ToastService.danger(
					tHtml(
						'admin/items/components/depublish-item-modal/depublish-item-modal___reden-mag-niet-leeg-zijn'
					)
				);
				return;
			}
			if (depublishType === 'depublish_with_replacement' && !replacementExternalId) {
				ToastService.danger(
					tHtml(
						'admin/items/components/depublish-item-modal/depublish-item-modal___je-moet-een-vervang-item-selecteren'
					)
				);
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
					Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
					item.uid
				);
			}
			if (depublishType === 'depublish_with_reason') {
				await ItemsService.setItemDepublishReason(item.uid, reasonHtml);
			} else if (depublishType === 'depublish_with_replacement' && replacementExternalId) {
				const replacementItem: Avo.Item.Item | null =
					await ItemsService.fetchItemByExternalId(replacementExternalId);

				if (!replacementItem) {
					ToastService.danger(
						tHtml(
							'admin/items/components/depublish-item-modal/depublish-item-modal___het-bepalen-van-de-id-van-het-vervang-item-is-mislukt'
						)
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
					Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
					replacementItem.uid
				);

				// Reroute replacement chain to new replacement item
				// eg: A => B => C
				// Item A is replaced by B
				// Item B is the current item that we want to replace by item C
				// The final replacement should look like this:
				// A => C
				// B => C
				const itemsReplacedByCurrentItem: Avo.Collection.RelationEntry<Avo.Item.Item>[] =
					(await RelationService.fetchRelationsByObject(
						'item',
						Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
						[item.uid]
					)) as Avo.Collection.RelationEntry<Avo.Item.Item>[];
				await Promise.all(
					itemsReplacedByCurrentItem.map(
						async (relation: Avo.Collection.RelationEntry<Avo.Item.Item>) => {
							// Remove the old relationship (A => B)
							await RelationService.deleteRelationsBySubject(
								'item',
								relation.subject,
								Lookup_Enum_Relation_Types_Enum.IsReplacedBy
							);
							// Insert new relationship that points to the same replacement item as the current item (A => C)
							await RelationService.insertRelation(
								'item',
								relation.subject,
								Lookup_Enum_Relation_Types_Enum.IsReplacedBy,
								replacementItem.uid
							);
						}
					)
				);
			}
			ToastService.success(
				tHtml(
					'admin/items/components/depublish-item-modal/depublish-item-modal___het-item-is-gedepubliceerd'
				)
			);
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
			ToastService.danger(
				tHtml(
					'admin/items/components/depublish-item-modal/depublish-item-modal___het-depubliceren-is-mislukt'
				)
			);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml(
				'admin/items/components/depublish-item-modal/depublish-item-modal___item-depubliceren'
			)}
			size="medium"
			onClose={handleClose}
			className="m-depublish-modal"
		>
			<ModalBody>
				<Form>
					<FormGroup
						label={tText(
							'admin/items/components/depublish-item-modal/depublish-item-modal___hoe-depubliceren'
						)}
					>
						<Select
							options={[
								{
									label: tText(
										'admin/items/components/depublish-item-modal/depublish-item-modal___enkel-depubliceren'
									),
									value: 'depublish',
								},
								{
									label: tText(
										'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceren-met-reden'
									),
									value: 'depublish_with_reason',
								},
								{
									label: tText(
										'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceren-en-vervang-item-aanduiden'
									),
									value: 'depublish_with_replacement',
								},
							]}
							value={depublishType}
							onChange={setDepublishType as (value: string) => void}
						/>
					</FormGroup>
					{depublishType === 'depublish_with_reason' && (
						<FormGroup
							label={tText(
								'admin/items/components/depublish-item-modal/depublish-item-modal___reden-tot-depubliceren'
							)}
						>
							<RichTextEditorWrapper
								placeholder={tText(
									'admin/items/components/depublish-item-modal/depublish-item-modal___geef-een-reden-waarom-dit-item-gedepubliceerd-wordt'
								)}
								state={reason || undefined}
								onChange={setReason}
							/>
						</FormGroup>
					)}
					{depublishType === 'depublish_with_replacement' && (
						<FormGroup
							label={tText(
								'admin/items/components/depublish-item-modal/depublish-item-modal___selecteer-item-ter-vervanging'
							)}
						>
							<ContentPicker
								initialValue={
									replacementExternalId
										? {
												type: 'ITEM',
												value: replacementExternalId,
										  }
										: undefined
								}
								onSelect={(pickerItem) =>
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
									label={tText(
										'admin/shared/components/change-labels-modal/change-labels-modal___annuleren'
									)}
									onClick={handleClose}
								/>
								<Button
									type="primary"
									label={tText(
										'admin/items/components/depublish-item-modal/depublish-item-modal___depubliceer'
									)}
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
