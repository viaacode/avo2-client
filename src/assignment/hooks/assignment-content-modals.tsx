import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { useState } from 'react';

import { ItemsService } from '../../admin/items/items.service';
import { SingleEntityModal, useSingleEntityModal } from '../../shared/hooks';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../assignment.const';
import { AssignmentBlockType } from '../assignment.types';
import { insertAtPosition } from '../helpers/insert-at-position';
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
					/>
				</>
			)}
		</>
	);

	return [ui, slice, block];
}
