import { isNil } from 'lodash';
import React from 'react';

import { RadioButtonGroup } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';

import { AssignmentHelper } from '../../assignment/assignment.helper';
import { AssignmentLayout } from '../../assignment/assignment.types';

export const renderContentLayoutOptionsButtons = (
	item: { content_layout?: AssignmentLayout },
	onChange: (value: string) => void = () => {},
	options?: RadioOption[]
) => {
	return (
		<RadioButtonGroup
			options={options || AssignmentHelper.getContentLayoutOptions()}
			value={(isNil(item.content_layout)
				? AssignmentLayout.PlayerAndText
				: item.content_layout
			).toString()}
			onChange={onChange}
		/>
	);
};
