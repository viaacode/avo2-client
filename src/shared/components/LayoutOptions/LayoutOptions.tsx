import { isNil } from 'lodash';
import React, { FunctionComponent } from 'react';

import { RadioButtonGroup } from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';

import { AssignmentHelper } from '../../../assignment/assignment.helper';
import { AssignmentLayout } from '../../../assignment/assignment.types';

export interface LayoutOptionsProps {
	item: { content_layout?: AssignmentLayout };
	onChange: (value: string) => void;
	options?: RadioOption[];
}

export const LayoutOptions: FunctionComponent<LayoutOptionsProps> = ({
	item,
	onChange = () => {},
	options = AssignmentHelper.getContentLayoutOptions(),
}) => {
	return (
		<RadioButtonGroup
			options={options}
			value={(isNil(item.content_layout)
				? AssignmentLayout.PlayerAndText
				: item.content_layout
			).toString()}
			onChange={onChange}
		/>
	);
};
