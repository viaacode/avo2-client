import { get, isBoolean, isNil } from 'lodash-es';
import React, { ReactElement, ReactNode } from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';

import { formatDate } from '../../../shared/helpers/formatters';

export function renderDetailRow(value: ReactNode, label: string): ReactElement {
	return (
		<tr key={`detail-row_${label}`}>
			<th>{label}</th>
			<td>{value}</td>
		</tr>
	);
}

export function renderSimpleDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		let value = get(obj, propAndTranslation[0]);
		if (isBoolean(value)) {
			value = value ? 'Ja' : 'Nee';
		}
		return renderDetailRow(isNil(value) ? '-' : value, propAndTranslation[1]);
	});
}

export function renderDateDetailRows(
	obj: any,
	propAndTranslations: ([string, string] | [string, string, string])[]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		return renderDetailRow(
			obj[propAndTranslation[0]]
				? formatDate(obj[propAndTranslation[0]])
				: propAndTranslation[2] || '-',
			propAndTranslation[1]
		);
	});
}

export function renderMultiOptionDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		return renderDetailRow(
			obj[propAndTranslation[0]] ? (
				<TagList
					swatches={false}
					tags={obj[propAndTranslation[0]].map(
						(subject: string): TagOption => ({
							id: subject,
							label: subject,
						})
					)}
				/>
			) : (
				'-'
			),
			propAndTranslation[1]
		);
	});
}
