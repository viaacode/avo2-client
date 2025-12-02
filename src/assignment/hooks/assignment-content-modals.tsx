import { Avo } from '@viaa/avo2-types';
import { useState } from 'react';

import { ItemsService } from '../../admin/items/items.service';
import { CollectionService } from '../../collection/collection.service';
import { CollectionOrBundle } from '../../collection/collection.types';
import { CutFragmentForAssignmentModal } from '../../item/components/modals/CutFragmentForAssignmentModal';
import { type ItemTrimInfo } from '../../item/item.types';
import { tHtml } from '../../shared/helpers/translate-html';
import {
  type SingleEntityModal,
  useSingleEntityModal,
} from '../../shared/hooks/useSingleEntityModal';
import { ToastService } from '../../shared/services/toast-service';
import { VideoStillService } from '../../shared/services/video-stills-service';
import { type Positioned } from '../../shared/types';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../assignment.const';
import { insertMultipleAtPosition } from '../helpers/insert-at-position';
import {
  AddBlockModal,
  type AddBlockModalProps,
} from '../modals/AddBlockModal';
import {
  AddBookmarkFragmentModal,
  type AddBookmarkFragmentModalProps,
} from '../modals/AddBookmarkFragmentModal';
import {
  AddCollectionModal,
  type AddCollectionModalProps,
} from '../modals/AddCollectionModal';
import {
  ConfirmSliceModal,
  type ConfirmSliceModalProps,
} from '../modals/ConfirmSliceModal';

export function useBlockListModals(
  blocks: Avo.Core.BlockItemBase[],
  setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void,
  isPupilCollection: boolean,
  config?: {
    confirmSliceConfig?: Partial<ConfirmSliceModalProps>;
    addBlockConfig?: Partial<AddBlockModalProps>;
    addBookmarkFragmentConfig?: Partial<AddBookmarkFragmentModalProps>;
    addCollectionConfig?: Partial<AddCollectionModalProps>;
  },
): [
  JSX.Element,
  SingleEntityModal<Pick<Avo.Assignment.Block, 'id'>>,
  SingleEntityModal<number>,
] {
  const slice = useSingleEntityModal<Pick<Avo.Assignment.Block, 'id'>>();
  const {
    isOpen: isConfirmSliceModalOpen,
    setOpen: setConfirmSliceModalOpen,
    entity: getConfirmSliceModalBlock,
  } = slice;

  const block = useSingleEntityModal<number>();
  const {
    isOpen: isAddBlockModalOpen,
    setOpen: setAddBlockModalOpen,
    entity: blockPosition,
  } = block;

  const [isAddFragmentModalOpen, setIsAddFragmentModalOpen] =
    useState<boolean>(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState<boolean>(false);
  const [isTrimItemModalOpen, setIsTrimItemModalOpen] =
    useState<boolean>(false);
  const [item, setItem] = useState<Avo.Item.Item | null>(null);

  const ui = (
    <>
      <ConfirmSliceModal
        {...config?.confirmSliceConfig}
        isOpen={!!isConfirmSliceModalOpen}
        block={getConfirmSliceModalBlock as Avo.Assignment.Block}
        isPupilCollection={isPupilCollection}
        onClose={() => setConfirmSliceModalOpen(false)}
        onConfirm={() => {
          const newBlocks = blocks.filter(
            (item) => item.id !== getConfirmSliceModalBlock?.id,
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
              if (blockPosition === undefined) {
                return;
              }

              switch (type) {
                case Avo.Core.BlockItemType.COLLECTION: {
                  setIsAddCollectionModalOpen(true);
                  break;
                }

                case Avo.Core.BlockItemType.ITEM: {
                  setIsAddFragmentModalOpen(true);
                  break;
                }

                case Avo.Core.BlockItemType.TEXT:
                case Avo.Core.BlockItemType.ZOEK: {
                  const assignmentBlock = {
                    id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
                    type,
                    position: blockPosition,
                    created_at: new Date().toISOString(),
                  };
                  const newBlocks = insertMultipleAtPosition(
                    blocks,
                    assignmentBlock,
                  );

                  setBlocks(newBlocks as Avo.Core.BlockItemBase[]);
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
              if (blockPosition === undefined) {
                return;
              }

              // fetch item details
              const item_meta = await ItemsService.fetchItemByExternalId(id);
              setItem(item_meta);
              setIsTrimItemModalOpen(true);
            }}
          />

          {item && (
            <CutFragmentForAssignmentModal // re-use Trim modal
              itemMetaData={item}
              isOpen={isTrimItemModalOpen}
              onClose={() => {
                setIsTrimItemModalOpen(false);
              }}
              afterCutCallback={async (itemTrimInfo: ItemTrimInfo) => {
                const assignmentBlock: Partial<Avo.Core.BlockItemBase> &
                  Positioned = {
                  id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
                  item_meta: item,
                  type: Avo.Core.BlockItemType.ITEM,
                  fragment_id: item.external_id,
                  position: blockPosition || 0,
                  start_oc: itemTrimInfo.hasCut
                    ? itemTrimInfo.fragmentStartTime
                    : null,
                  end_oc: itemTrimInfo.hasCut
                    ? itemTrimInfo.fragmentEndTime
                    : null,
                  thumbnail_path:
                    itemTrimInfo.hasCut && item?.type_id
                      ? await VideoStillService.getVideoStill(
                          item.external_id,
                          item.type_id,
                          itemTrimInfo.fragmentStartTime * 1000,
                        )
                      : null,
                  created_at: new Date().toISOString(),
                };
                const newBlocks = insertMultipleAtPosition(
                  blocks,
                  assignmentBlock,
                );

                setBlocks(newBlocks as Avo.Core.BlockItemBase[]);

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
            addCollectionCallback={async (
              collectionId: string,
              withDescription: boolean,
            ) => {
              if (blockPosition === undefined) {
                return;
              }

              // fetch collection details
              const collection =
                await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
                  collectionId,
                  CollectionOrBundle.COLLECTION,
                  undefined,
                );

              if (!collection) {
                ToastService.danger(
                  tHtml(
                    'assignment/views/assignment-edit___de-collectie-kon-niet-worden-opgehaald',
                  ),
                );
                return;
              }

              if (collection.collection_fragments) {
                const mapped = collection.collection_fragments.map(
                  (collectionItem, index): Partial<Avo.Core.BlockItemBase> => {
                    // Note: logic almost identical as in AssignmentService.importCollectionToAssignment
                    // But with minor differences (id, item_meta, ..)
                    const block: Partial<Avo.Core.BlockItemBase> = {
                      id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${
                        new Date().valueOf() + index
                      }`,
                      item_meta: collectionItem.item_meta,
                      type: collectionItem.type,
                      fragment_id: collectionItem.external_id,
                      position: blockPosition + index,
                      original_title: collectionItem.custom_title,
                      original_description: collectionItem.custom_description,
                      custom_title: null,
                      custom_description: null,
                      use_custom_fields: false,
                      start_oc: collectionItem.start_oc,
                      end_oc: collectionItem.end_oc,
                      thumbnail_path: collectionItem.thumbnail_path,
                    };

                    if (collectionItem.type === Avo.Core.BlockItemType.TEXT) {
                      // text: original text null, custom text set
                      block.custom_title = collectionItem.custom_title;
                      block.custom_description =
                        collectionItem.custom_description;
                      block.use_custom_fields = true;
                      block.type = Avo.Core.BlockItemType.TEXT;
                    } else {
                      // ITEM
                      // custom_title and custom_description remain null
                      // regardless of withDescription: ALWAYS copy the fragment custom title and description to the original fields
                      // Since importing from collection, the collection is the source of truth and the original == collection fields
                      block.original_title = collectionItem.custom_title;
                      block.original_description =
                        collectionItem.custom_description;
                      block.use_custom_fields = !withDescription;
                      block.type = Avo.Core.BlockItemType.ITEM;
                    }

                    return block;
                  },
                );

                const newBlocks = insertMultipleAtPosition(
                  blocks,
                  ...(mapped as Positioned[]),
                );

                setBlocks(newBlocks as Avo.Core.BlockItemBase[]);

                // Finish by triggering any configured callback
                const callback =
                  config?.addCollectionConfig?.addCollectionCallback;
                callback && callback(collectionId, withDescription);
              }
            }}
          />
        </>
      )}
    </>
  );

  return [ui, slice, block];
}
