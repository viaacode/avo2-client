import React, { FunctionComponent } from 'react';

import { CheckboxDropdown } from './CheckboxDropdown/CheckboxDropdown';
import { CheckboxModal } from './CheckboxModal/CheckboxModal';

export interface CheckboxOption {
	label: string;
	// Provide option count separately from the label
	// because the selected filters in the taglist do not contain the optionCount
	optionCount?: number;
	id: string;
	checked: boolean;
}

export interface CheckboxSwitcherProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

/**
 * Switches between CheckboxDropdown and CheckboxModal when the number of items increases/decreases
 * Less than or equal to 7 items => CheckboxDropdown
 * More than 7 => CheckboxModal
 * @param label
 * @param id
 * @param options
 * @param disabled
 * @param onChange
 * @constructor
 */
export const CheckboxSwitcher: FunctionComponent<CheckboxSwitcherProps> = ({
	label,
	id,
	options,
	disabled,
	onChange,
}: CheckboxSwitcherProps) => {
	if (options.length <= 7) {
		return <CheckboxDropdown label={label} id={id} options={options} onChange={onChange} />;
	}
	return <CheckboxModal label={label} id={id} options={options} onChange={onChange} />;
};
