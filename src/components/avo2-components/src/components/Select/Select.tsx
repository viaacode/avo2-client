import React, { ChangeEvent, FunctionComponent } from 'react';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	options: SelectOption[];
	id?: string;
	disabled?: boolean;
	value?: string;
	onChange?: (value: string) => void;
}

export const Select: FunctionComponent<SelectProps> = ({
	options,
	id,
	disabled = false,
	value,
	onChange = () => {},
}: SelectProps) => {
	function onValueChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange(event.target.value);
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
