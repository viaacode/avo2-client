import {
  AvoAssignmentBlock,
  AvoCoreBlockItemBase,
  AvoCoreBlockItemType,
} from '@viaa/avo2-types';
import { type ReactNode, useMemo } from 'react';
import { switchAssignmentBlockPositions } from '../../assignment/helpers/switch-positions';
import { GET_BLOCK_ICON } from '../components/BlockList/BlockIconWrapper/BlockIconWrapper.consts';
import { BLOCK_ITEM_LABELS } from '../components/BlockList/BlockList.consts';
import {
  BlockListSorter,
  type ListSorterItem,
  type ListSorterProps,
} from '../components/ListSorter/ListSorter';
import { getBlockColor } from '../helpers/get-block-color';

export function useBlocksList(
  blocks: AvoCoreBlockItemBase[],
  setBlocks: (newBlocks: AvoCoreBlockItemBase[]) => void,
  config?: {
    listSorter?: Partial<ListSorterProps<AvoCoreBlockItemBase>>;
    listSorterItem?: Partial<ListSorterItem>;
  },
): [ReactNode, (AvoCoreBlockItemBase & ListSorterItem)[]] {
  const items = useMemo(() => {
    return (blocks || []).map((block) => {
      const mapped: AvoCoreBlockItemBase & ListSorterItem = {
        ...block,
        ...config?.listSorterItem,
        icon: GET_BLOCK_ICON(block),
        color: getBlockColor(block as AvoAssignmentBlock),
        onPositionChange: (item, delta) => {
          const switched = switchAssignmentBlockPositions(
            blocks,
            item as AvoCoreBlockItemBase,
            delta,
          );
          setBlocks(switched as AvoCoreBlockItemBase[]);
        },
      };

      return mapped;
    });
  }, [blocks, setBlocks, config]);

  const ui = useMemo(
    () => (
      <BlockListSorter
        {...config?.listSorter}
        heading={(item) =>
          item &&
          BLOCK_ITEM_LABELS(!!blocks[0].assignment_response_id)[
            item.type as AvoCoreBlockItemType
          ]
        }
        items={items}
      />
    ),
    [items, config],
  );

  return [ui, items];
}
