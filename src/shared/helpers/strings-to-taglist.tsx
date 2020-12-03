import { noop } from 'lodash-es';
import React, { MouseEvent, ReactNode } from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';

export function stringsToTagList(
	labelsOrObjs: string[] | any[],
	prop: string | null = null,
	onTagClicked: (tagId: string | number, clickEvent: MouseEvent) => void = noop,
	onTagClosed?: (tagId: string | number, clickEvent: MouseEvent) => void
): ReactNode {
	if (!labelsOrObjs || !labelsOrObjs.length) {
		return null;
	}
	return (
		<TagList
			tags={(labelsOrObjs as any[]).map(
				(labelOrObj: string | any): TagOption => {
					const label = prop ? labelOrObj[prop] : labelOrObj;
					return {
						label,
						id: label,
					};
				}
			)}
			closable={!!onTagClosed}
			onTagClicked={onTagClicked}
			onTagClosed={onTagClosed || noop}
			swatches={false}
		/>
	);
}
