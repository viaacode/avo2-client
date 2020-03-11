import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CheckboxOption } from '../CheckboxDropdownModal/CheckboxDropdownModal';
import { CheckboxDropdownModal } from '../index';

export interface BooleanCheckboxDropdownProps {
	label: string;
	id: string;
	disabled?: boolean;
	onChange: (value: boolean | null, id: string) => void;
}

const BooleanCheckboxDropdown: FunctionComponent<BooleanCheckboxDropdownProps> = ({
	label,
	id,
	disabled,
	onChange,
}) => {
	const [t] = useTranslation();

	const [checkboxOptions, setCheckboxOptions] = useState<CheckboxOption[]>([
		{ label: t('Ja'), id: 'true', checked: false },
		{ label: t('Nee'), id: 'false', checked: false },
	]);

	useEffect(() => {
		if (
			(checkboxOptions[0].checked && checkboxOptions[1].checked) ||
			(!checkboxOptions[0].checked && !checkboxOptions[1].checked)
		) {
			onChange(null, id);
		} else if (checkboxOptions[0].checked) {
			onChange(true, id);
		} else {
			onChange(false, id);
		}
	}, [checkboxOptions, id, onChange]);

	// Methods
	const handleCheckboxChange = (selectedCheckboxes: string[]) => {
		setCheckboxOptions([
			{ ...checkboxOptions[0], checked: selectedCheckboxes.includes('true') },
			{ ...checkboxOptions[1], checked: selectedCheckboxes.includes('false') },
		]);
	};

	return (
		<CheckboxDropdownModal
			label={label}
			id={id}
			options={checkboxOptions}
			onChange={handleCheckboxChange}
			disabled={disabled}
		/>
	);
};

export default BooleanCheckboxDropdown;
