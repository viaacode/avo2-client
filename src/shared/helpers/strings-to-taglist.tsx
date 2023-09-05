import { TagList, TagOption } from '@viaa/avo2-components';
import { isString, noop } from 'lodash-es';
import React, { MouseEvent, ReactNode } from 'react';

export function stringsToTagList(
	labelsOrObjs: string[] | any[],
	propOrLabelSelectFunc: string | ((obj: any) => string) | null = null,
	onTagClicked?: (tagId: string | number, clickEvent: MouseEvent) => void,
	onTagClosed: (tagId: string | number, clickEvent: MouseEvent) => void = noop
): ReactNode {
	if (!labelsOrObjs || !labelsOrObjs.length) {
		return null;
	}
	return (
		<TagList
			tags={(labelsOrObjs as any[]).map((labelOrObj: string | any): TagOption => {
				let label: string;
				if (isString(propOrLabelSelectFunc)) {
					label = labelOrObj[propOrLabelSelectFunc];
				} else if (propOrLabelSelectFunc) {
					label = propOrLabelSelectFunc(labelOrObj);
				} else {
					label = labelOrObj;
				}
				return {
					label,
					id: label,
				};
			})}
			closable={!!onTagClosed}
			onTagClicked={onTagClicked}
			onTagClosed={(tagId, evt) => onTagClosed(tagId, evt)}
			swatches={false}
		/>
	);
}
