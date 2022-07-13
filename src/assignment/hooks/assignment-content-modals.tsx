import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ItemsService } from '../../admin/items/items.service';
import { CollectionService } from '../../collection/collection.service';
import { SingleEntityModal, useSingleEntityModal } from '../../shared/hooks';
import { ToastService } from '../../shared/services';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../assignment.const';
import { AssignmentBlockType } from '../assignment.types';
import { insertAtPosition, insertMultipleAtPosition } from '../helpers/insert-at-position';
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
									const newBlocks = insertAtPosition(blocks, {
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
								(await ItemsService.fetchItemByExternalId(id)) || undefined;
							const newBlocks = insertAtPosition(blocks, {
								id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
								item_meta,
								type: AssignmentBlockType.ITEM,
								fragment_id: id,
								position: getAddBlockModalPosition,
							} as AssignmentBlock);

							setBlocks(newBlocks);

							// Finish by triggering any configured callback
							const callback = config?.addBookmarkFragmentConfig?.addFragmentCallback;
							callback && callback(id);
						}}
					/>

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
										original_title: withDescription
											? collectionItem.custom_title
											: null,
										original_description: withDescription
											? collectionItem.custom_description
											: null,
										custom_title: collectionItem.use_custom_fields
											? collectionItem.custom_title
											: null,
										custom_description: collectionItem.use_custom_fields
											? collectionItem.custom_description
											: null,
										use_custom_fields: collectionItem.use_custom_fields,
									})
								);

								const newBlocks = insertMultipleAtPosition(
									blocks,
									mapped as AssignmentBlock[]
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
