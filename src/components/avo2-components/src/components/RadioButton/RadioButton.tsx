import React, { ChangeEvent, FunctionComponent, useState } from 'react';

export interface RadioButtonProps {
	label: string;
	name: string;
	id?: string;
	disabled?: boolean;
	defaultChecked?: boolean;
	onChange?: (checked: boolean) => void;
}

export const RadioButton: FunctionComponent<RadioButtonProps> = ({
	label,
	name,
	id,
	disabled = false,
	defaultChecked = false,
	onChange = () => {},
}: RadioButtonProps) => {
	const [value, setValue] = useState(defaultChecked);

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const { checked } = event.target;

		if (checked !== value) {
			setValue(checked);
			onChange(checked);
		}
	}

	return (
		<div className="c-radio">
			<label>
				<input
					type="radio"
					name={name}
					id={id}
					checked={value}
					disabled={disabled}
					onChange={onValueChange}
				/>
				{label}
			</label>
		</div>
	);
};
