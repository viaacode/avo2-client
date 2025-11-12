import {RadioButtonGroup, type RadioOption} from '@viaa/avo2-components';
import {isNil, noop} from 'es-toolkit';
import React, {type FC} from 'react';

import {AssignmentHelper} from '../../../assignment/assignment.helper.js';
import {AssignmentLayout} from '../../../assignment/assignment.types.js';

interface LayoutOptionsProps {
	item: { content_layout?: AssignmentLayout };
	onChange: (value: string) => void;
	disabled?: boolean;
	options?: RadioOption[];
}

export const LayoutOptions: FC<LayoutOptionsProps> = ({
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
				: item.content_layout as AssignmentLayout
			).toString()}
			onChange={onChange}
		/>
	);
};
