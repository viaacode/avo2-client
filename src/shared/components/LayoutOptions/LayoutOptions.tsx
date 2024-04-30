import { RadioButtonGroup, type RadioOption } from '@viaa/avo2-components';
import { isNil, noop } from 'lodash-es';
import React, { type FunctionComponent } from 'react';

import { AssignmentHelper } from '../../../assignment/assignment.helper';
import { AssignmentLayout } from '../../../assignment/assignment.types';

export interface LayoutOptionsProps {
	item: { content_layout?: AssignmentLayout };
	onChange: (value: string) => void;
	disabled?: boolean;
	options?: RadioOption[];
}

export const LayoutOptions: FunctionComponent<LayoutOptionsProps> = ({
	item,
	onChange = noop,
	disabled,
	options,
}) => {
	const items = options || AssignmentHelper.getContentLayoutOptions();

	const mapOptions = (option: RadioOption) => {
		return {
			...option,
			disabled,
		};
	};

	return (
		<RadioButtonGroup
			options={items.map(mapOptions)}
			value={(isNil(item.content_layout)
				? AssignmentLayout.PlayerAndText
				: item.content_layout
			).toString()}
			onChange={onChange}
		/>
	);
};
