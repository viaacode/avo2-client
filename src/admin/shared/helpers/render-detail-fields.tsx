import { get, isBoolean, isNil } from 'lodash-es';
import React, { ReactElement } from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';

import { formatDate } from '../../../shared/helpers/formatters';

export function renderSimpleDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		let value = get(obj, propAndTranslation[0]);
		if (isBoolean(value)) {
			value = value ? 'Ja' : 'Nee';
		}
		return (
			<tr>
				<th>{propAndTranslation[1]}</th>
				<td>{isNil(value) ? '-' : value}</td>
			</tr>
		);
	});
}

export function renderDateDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		return (
			<tr>
				<th>{propAndTranslation[1]}</th>
				<td>{obj[propAndTranslation[0]] ? formatDate(obj[propAndTranslation[0]]) : '-'}</td>
			</tr>
		);
	});
}

export function renderMultiOptionDetailRows(
	obj: any,
	propAndTranslations: [string, string][]
): ReactElement[] {
	return propAndTranslations.map(propAndTranslation => {
		return (
			<tr>
				<th>{propAndTranslation[1]}</th>
				<td>
					{obj[propAndTranslation[0]] ? (
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
					)}
				</td>
			</tr>
		);
	});
}
