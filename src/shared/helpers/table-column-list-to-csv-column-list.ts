import { type TableColumn } from '@viaa/avo2-components';
import { compact } from 'es-toolkit';

export const ACTIONS_TABLE_COLUMN_ID = 'actions';

export function tableColumnListToCsvColumnList(
  tableColumnList: TableColumn[],
): {
  label: string;
  id: string;
}[] {
  return compact(
    tableColumnList
      .filter((column) => column.id !== ACTIONS_TABLE_COLUMN_ID)
      .map((column) => {
        const label = column.label || column.tooltip;
        if (!label) {
          return null;
        }
        return { label: label, id: column.id };
      }),
  );
}
