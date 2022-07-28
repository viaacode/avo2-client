import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ItemsService } from '../../admin/items/items.service';
import { CollectionService } from '../../collection/collection.service';
import { AddToAssignmentModal } from '../../item/components';
import { ItemTrimInfo } from '../../item/item.types';
import { SingleEntityModal, useSingleEntityModal } from '../../shared/hooks';
import { ToastService } from '../../shared/services';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../assignment.const';
import { AssignmentBlockType } from '../assignment.types';
import { insertMultipleAtPosition } from '../helpers/insert-at-position';
import AddBlockModal, { AddBlockModalProps } from '../modals/AddBlockModal';
import AddBookmarkFragmentModal, {
	AddBookmarkFragmentModalProps,
} from '../modals/AddBookmarkFragmentModal';
import AddCollectionModal, { AddCollectionModalProps } from '../modals/AddCollectionModal';
import ConfirmSliceModal, { ConfirmSliceModalProps } from '../modals/ConfirmSliceModal';

export function useBlockListModals(
	blocks: Avo.Core.BlockItemBase[],
	setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void,
	config?: {
		confirmSliceConfig?: Partial<ConfirmSliceModalProps>;
		addBlockConfig?: Partial<AddBlockModalProps>;
		addBookmarkFragmentConfig?: Partial<AddBookmarkFragmentModalProps>;
		addCollectionConfig?: Partial<AddCollectionModalProps>;
	}
): [JSX.Element, SingleEntityModal<Pick<AssignmentBlock, 'id'>>, SingleEntityModal<number>] {
	const [t] = useTranslation();

	const slice = useSingleEntityModal<Pick<AssignmentBlock, 'id'>>();
	const {
		isOpen: isConfirmSliceModalOpen,
		setOpen: setConfirmSliceModalOpen,
		entity: getConfirmSliceModalBlock,
	} = slice;

	const block = useSingleEntityModal<number>();
	const {
		isOpen: isAddBlockModalOpen,
		setOpen: setAddBlockModalOpen,
		entity: getAddBlockModalPosition,
	} = block;

	const [isAddFragmentModalOpen, setIsAddFragmentModalOpen] = useState<boolean>(false);
	const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState<boolean>(false);
	const [isTrimItemModalOpen, setIsTrimItemModalOpen] = useState<boolean>(false);
	const [item, setItem] = useState<Avo.Item.Item | null>(null);

	const ui = (
		<>
			<ConfirmSliceModal
				{...config?.confirmSliceConfig}
				isOpen={!!isConfirmSliceModalOpen}
				block={getConfirmSliceModalBlock as AssignmentBlock}
				onClose={() => setConfirmSliceModalOpen(false)}
				onConfirm={() => {
					const newBlocks = blocks.filter(
						(item) => item.id !== getConfirmSliceModalBlock?.id
					);

					setBlocks(newBlocks);

					setConfirmSliceModalOpen(false);
				}}
			/>

			{blocks && (
				<>
					<AddBlockModal
						{...config?.addBlockConfig}
						isOpen={!!isAddBlockModalOpen}
						blocks={blocks}
						onClose={() => setAddBlockModalOpen(false)}
						onConfirm={(type) => {
							if (getAddBlockModalPosition === undefined) {
								return;
							}

							switch (type) {
								case 'COLLECTIE': {
									setIsAddCollectionModalOpen(true);
									break;
								}

								case AssignmentBlockType.ITEM: {
									setIsAddFragmentModalOpen(true);
									break;
								}

								case AssignmentBlockType.TEXT:
								case AssignmentBlockType.ZOEK: {
									const newBlocks = insertMultipleAtPosition(blocks, {
										id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
										type,
										position: getAddBlockModalPosition,
									} as AssignmentBlock); // TODO: avoid cast

									setBlocks(newBlocks);
									break;
								}

								default:
									break;
							}

							setAddBlockModalOpen(false);
						}}
					/>

					<AddBookmarkFragmentModal
						{...config?.addBookmarkFragmentConfig}
						isOpen={isAddFragmentModalOpen}
						onClose={() => setIsAddFragmentModalOpen(false)}
						addFragmentCallback={async (id) => {
							if (getAddBlockModalPosition === undefined) {
								return;
							}

							// fetch item details
							const item_meta =
								(await ItemsService.fetchItemByExternalId(id)) || null;
							setItem(item_meta);
							setIsTrimItemModalOpen(true);
						}}
					/>

					{item && (
						<AddToAssignmentModal // re-use Trim modal
							itemMetaData={item}
							isOpen={isTrimItemModalOpen}
							onClose={() => {
								setIsTrimItemModalOpen(false);
							}}
							onAddToAssignmentCallback={async (itemTrimInfo: ItemTrimInfo) => {
								const newBlocks = insertMultipleAtPosition(blocks, {
									id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
									item_meta: item,
									type: AssignmentBlockType.ITEM,
									fragment_id: item.external_id,
									position: getAddBlockModalPosition,
									start_oc: itemTrimInfo.hasCut
										? itemTrimInfo.fragmentStartTime
										: null,
									end_oc: itemTrimInfo.hasCut
										? itemTrimInfo.fragmentEndTime
										: null,
								} as AssignmentBlock);

								setBlocks(newBlocks);

								// Finish by triggering any configured callback
								const callback =
									config?.addBookmarkFragmentConfig?.addFragmentCallback;
								callback && callback(item.external_id);
								setIsTrimItemModalOpen(false);
							}}
						/>
					)}

					<AddCollectionModal
						{...config?.addCollectionConfig}
						isOpen={isAddCollectionModalOpen}
						onClose={() => setIsAddCollectionModalOpen(false)}
						addCollectionCallback={async (id, withDescription) => {
							if (getAddBlockModalPosition === undefined) {
								return;
							}

							// fetch collection details
							const collection = await CollectionService.fetchCollectionOrBundleById(
								id,
								'collection',
								undefined,
								true
							);

							if (!collection) {
								ToastService.danger(
									t(
										'assignment/views/assignment-edit___de-collectie-kon-niet-worden-opgehaald'
									)
								);
								return;
							}

							if (collection.collection_fragments) {
								const mapped = collection.collection_fragments.map(
									(collectionItem, index): Partial<AssignmentBlock> => ({
										id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${
											new Date().valueOf() + index
										}`,
										item_meta: collectionItem.item_meta,
										type: collectionItem.type,
										fragment_id: collectionItem.external_id,
										position: getAddBlockModalPosition + index,
										original_title: collectionItem.custom_title,
										original_description: collectionItem.custom_description,
										custom_title: null,
										custom_description: null,
										use_custom_fields: !withDescription,
										start_oc: collectionItem.start_oc,
										end_oc: collectionItem.end_oc,
										thumbnail_path: collectionItem.thumbnail_path,
									})
								);

								const newBlocks = insertMultipleAtPosition(
									blocks,
									...(mapped as AssignmentBlock[])
								);

								setBlocks(newBlocks);

								// Finish by triggering any configured callback
								const callback = config?.addCollectionConfig?.addCollectionCallback;
								callback && callback(id, withDescription);
							}
						}}
					/>
				</>
			)}
		</>
	);

	return [ui, slice, block];
}
