import { AvoSearchOrderDirection } from '@viaa/avo2-types';
import { type CollectionsOrBundlesOverviewTableCols } from '../../admin/collectionsOrBundles/collections-or-bundles.types';

export const COLLECTIONS_OR_BUNDLES_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
  [columnId in CollectionsOrBundlesOverviewTableCols]: (
    order: AvoSearchOrderDirection,
  ) => any;
}> = {
  share_type: (order: AvoSearchOrderDirection) => ({
    share_type_order: order,
  }),
};
