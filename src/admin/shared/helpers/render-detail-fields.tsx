import { get, isBoolean, isNil, isString } from 'lodash-es';
import React, { type ReactElement, type ReactNode } from 'react';

import { Html } from '../../../shared/components/Html/Html';
import { formatDate } from '../../../shared/helpers/formatters';
import { tText } from '../../../shared/helpers/translate-text';

export function renderDetailRow(value: ReactNode, label: string): ReactElement {
	return (
		<tr key={`detail-row_${label}`}>
			<th>{label}</th>
			{isString(value) && (
				<td>
					<Html content={value} />
				</td>
			)}
			{!isString(value) && <td>{value}</td>}
		</tr>
	);
}

export function renderSimpleDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map((propAndTranslation) => {
		let value = get(obj, propAndTranslation[0]);
		if (isBoolean(value)) {
			value = value
				? tText('admin/shared/helpers/render-detail-fields___ja')
				: tText('admin/shared/helpers/render-detail-fields___nee');
		}
		return renderDetailRow(isNil(value) ? '-' : value, propAndTranslation[1]);
	});
}

export function renderDateDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map((propAndTranslation) => {
		const value = get(obj, propAndTranslation[0]);
		return renderDetailRow(value ? formatDate(value) : '-', propAndTranslation[1]);
	});
}
