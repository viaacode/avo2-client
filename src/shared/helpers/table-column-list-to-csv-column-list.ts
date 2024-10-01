import { type TableColumn } from '@viaa/avo2-components';
import { compact } from 'lodash-es';

export function tableColumnListToCsvColumnList(tableColumnList: TableColumn[]): {
	label: string;
	id: string;
}[] {
	return compact(
		tableColumnList.map((column) => {
			const label = column.label || column.tooltip;
			if (!label) {
				return null;
			}
			return { label: label, id: column.id };
		})
	).filter((column) => column.label.toLowerCase() !== 'actions');
}
