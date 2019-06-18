import React, { ChangeEvent, FunctionComponent, useState } from 'react';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	options: SelectOption[];
	id?: string;
	disabled?: boolean;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

export const Select: FunctionComponent<SelectProps> = ({
	options,
	id,
	disabled = false,
	defaultValue,
	onChange = () => {},
}: SelectProps) => {
	const [value, setValue] = useState(defaultValue);

	function onValueChange(event: ChangeEvent<HTMLSelectElement>) {
		const { value: val } = event.target;

		if (val !== value) {
			setValue(val);
			onChange(val);
		}
	}

	return (
		<div className="c-select-holder">
			<select
				className="c-select"
				id={id}
				value={value}
				disabled={disabled}
				onChange={onValueChange}
			>
				{options.map(({ value, label, disabled }, index) => (
					<option key={index} value={value} disabled={disabled}>
						{label}
					</option>
				))}
			</select>
		</div>
	);
};
