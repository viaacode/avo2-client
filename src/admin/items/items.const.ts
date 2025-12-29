import { type FilterableColumn, TableFilterType, } from '@meemoo/admin-core-ui/admin';
import { IconName, type TabProps } from '@viaa/avo2-components';

import { AvoSearchOrderDirection } from '@viaa/avo2-types';
import { type CheckboxDropdownModalProps, type CheckboxOption, } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { type ItemsOverviewTableCols, type UnpublishedItemsOverviewTableCols, } from './items.types';

export enum ITEMS_TABS {
  GENERAL = 'GENERAL',
  COLLECTIONS = 'COLLECTIONS',
  ASSIGNMENTS = 'ASSIGNMENTS',
  QUICK_LANE = 'QUICK_LANE',
  EMBEDS = 'EMBEDS',
}

export const GET_TABS: () => TabProps[] = () => [
  {
    label: tText('admin/items/items___algemeen'),
    id: ITEMS_TABS.GENERAL,
  },
  {
    label: tText('admin/items/items___collecties'),
    icon: IconName.collection,
    id: ITEMS_TABS.COLLECTIONS,
  },
  {
    label: tText('admin/items/items___opdrachten'),
    icon: IconName.clipboard,
    id: ITEMS_TABS.ASSIGNMENTS,
  },
  {
    label: tText('admin/items/items___gedeelde-links'),
    icon: IconName.link2,
    id: ITEMS_TABS.QUICK_LANE,
  },
  {
    label: tText('admin/items/items___ingesloten-fragmenten'),
    icon: IconName.code,
    id: ITEMS_TABS.EMBEDS,
  },
];

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
  [columnId in ItemsOverviewTableCols]: (order: AvoSearchOrderDirection) => any;
}> = {
  organisation: (order: AvoSearchOrderDirection) => ({
    organisation: { name: order },
  }),
  type: (order: AvoSearchOrderDirection) => ({ type: { label: order } }),
  views: (order: AvoSearchOrderDirection) => ({
    item_counts: { views: order },
  }),
  in_collection: (order: AvoSearchOrderDirection) => ({
    item_counts: { in_collection: order },
  }),
  bookmarks: (order: AvoSearchOrderDirection) => ({
    item_counts: { bookmarks: order },
  }),
  in_assignment: (order: AvoSearchOrderDirection) => ({
    item_counts: { in_assignment: order },
  }),
  quick_lane_links: (order: AvoSearchOrderDirection) => ({
    item_counts: {
      quick_lane_links: order,
    },
  }),
};

export const GET_ITEM_OVERVIEW_TABLE_COLS: (
  seriesOptions: CheckboxOption[],
  cpOptions: CheckboxOption[],
) => any[] = (seriesOptions: CheckboxOption[], cpOptions: CheckboxOption[]) => [
  {
    id: 'external_id',
    label: tText('admin/items/items___pid'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'title',
    label: tText('admin/items/items___titel'),
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'series',
    label: tText('admin/items/items___reeks'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: seriesOptions,
      showMaxOptions: 40,
    } as CheckboxDropdownModalProps,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'issued',
    label: tText('admin/items/items___uitgegeven'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.DateRangeDropdown,
    dataType: TableColumnDataType.dateTime,
  },
  {
    id: 'published_at',
    label: tText('admin/items/items___published'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.DateRangeDropdown,
    dataType: TableColumnDataType.dateTime,
  },
  {
    id: 'type',
    label: tText('admin/items/items___type'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [
        { label: tText('admin/items/items___video'), id: 'video' },
        { label: tText('admin/items/items___audio'), id: 'audio' },
      ] as CheckboxOption[],
      showMaxOptions: 40,
    } as CheckboxDropdownModalProps,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'organisation',
    label: tText('admin/items/items___cp'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: cpOptions,
      showMaxOptions: 40,
    } as CheckboxDropdownModalProps,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'is_published',
    label: tText('admin/items/items___publiek'),
    sortable: true,
    visibleByDefault: true,
    filterType: TableFilterType.CheckboxDropdownModal,
    filterProps: {
      options: [
        {
          label: tText('admin/items/items___gepubliceerd'),
          id: 'published',
        },
        {
          label: tText('admin/items/items___gedepubliceerd'),
          id: 'unpublished',
        },
        {
          label: tText('admin/items/items___gedepubliceerd-pancarte'),
          id: 'unpublished-with-reason',
        },
        {
          label: tText('admin/items/items___gedepubliceerd-merge'),
          id: 'unpublished-with-merge',
        },
      ],
    },
    dataType: TableColumnDataType.boolean,
  },
  {
    id: 'views',
    tooltip: tText(
      'admin/collections-or-bundles/collections-or-bundles___bekeken',
    ),
    icon: IconName.eye,
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  },
  {
    id: 'in_collection',
    tooltip: tText('admin/items/items___aantal-keer-opgenomen-in-collectie'),
    icon: IconName.collection,
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  },
  {
    id: 'bookmarks',
    tooltip: tText(
      'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-bladwijzer',
    ),
    icon: IconName.bookmark,
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  },
  {
    id: 'quick_lane_links',
    tooltip: tText('admin/items/items___aantal-keer-gedeeld-met-leerlingen'),
    icon: IconName.link2,
    sortable: true,
    visibleByDefault: true,
    dataType: TableColumnDataType.number,
  },
  {
    id: 'in_assignment',
    tooltip: tText(
      'admin/collections-or-bundles/views/collections-or-bundles-overview___aantal-keer-opgenomen-in-een-opdracht',
    ),
    icon: IconName.clipboard,
    sortable: true,
    dataType: TableColumnDataType.number,
  },
  {
    id: ACTIONS_TABLE_COLUMN_ID,
    tooltip: tText('admin/items/items___acties'),
    visibleByDefault: true,
  },
];

export const GET_PUBLISH_ITEM_OVERVIEW_TABLE_COLS: () => FilterableColumn<UnpublishedItemsOverviewTableCols>[] =
  () => [
    {
      id: 'title',
      label: tText('admin/items/items___titel'),
      sortable: true,
      visibleByDefault: true,
      dataType: TableColumnDataType.string,
    },
    {
      id: 'pid',
      label: tText('admin/items/items___pid'),
      sortable: true,
      visibleByDefault: true,
      dataType: TableColumnDataType.string,
    },
    {
      id: 'updated_at',
      label: tText('admin/items/items___aangepast-op-mam'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.DateRangeDropdown,
      dataType: TableColumnDataType.dateTime,
    },
    {
      id: 'status',
      label: tText('admin/items/items___status'),
      sortable: true,
      visibleByDefault: true,
      filterType: TableFilterType.CheckboxDropdownModal,
      filterProps: {
        options: [
          {
            label: tText('admin/items/items___nieuw'),
            id: 'NEW',
          },
          {
            label: tText('admin/items/items___update'),
            id: 'UPDATE',
          },
        ],
      },

      dataType: TableColumnDataType.string,
    },
    {
      id: ACTIONS_TABLE_COLUMN_ID,
      tooltip: tText('admin/items/items___acties'),
      visibleByDefault: true,
    },
  ];

export const GET_ITEM_USED_BY_COLLECTIONS_AND_ASSIGNMENTS_COLUMNS = () => [
  {
    label: tText('admin/items/views/item-detail___titel'),
    id: 'title',
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    label: tText('admin/items/views/item-detail___auteur'),
    id: 'owner',
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    label: 'Organisatie',
    id: 'organisation',
    sortable: true,
  },
  {
    label: tText('admin/items/items___publiek'),
    id: 'isPublic',
    sortable: true,
    dataType: TableColumnDataType.boolean,
  },
  {
    tooltip: tText('admin/items/views/item-detail___acties'),
    id: ACTIONS_TABLE_COLUMN_ID,
    sortable: false,
  },
];

export const GET_ITEM_USED_BY_QUICK_LANES = () => [
  {
    id: 'title',
    label: tText('workspace/views/quick-lane-overview___titel'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'owner',
    label: tText('workspace/views/quick-lane-overview___aangemaakt-door'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'organisation',
    label: tText('workspace/views/quick-lane-overview___organisatie'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'createdAt',
    label: tText('workspace/views/quick-lane-overview___aangemaakt-op'),
    sortable: true,
    dataType: TableColumnDataType.dateTime,
  },
];

export const GET_ITEM_USED_BY_EMBED_CODES = () => [
  {
    id: 'title',
    label: tText('admin/items/items___titel'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'owner',
    label: tText('admin/items/items___aangemaakt-door'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
  {
    id: 'createdAt',
    label: tText('admin/items/items___aangemaakt-op'),
    sortable: true,
    dataType: TableColumnDataType.dateTime,
  },
  {
    id: 'externalWebsite',
    label: tText('admin/items/items___gedeeld-op'),
    sortable: true,
    dataType: TableColumnDataType.string,
  },
];
