import React, { ChangeEvent, FunctionComponent, useState } from 'react';

export interface CheckboxProps {
	label: string;
	id?: string;
	disabled?: boolean;
	defaultChecked?: boolean;
	onChange?: (checked: boolean) => void;
}

export const Checkbox: FunctionComponent<CheckboxProps> = ({
	label,
	id,
	disabled = false,
	defaultChecked = false,
	onChange = () => {},
}: CheckboxProps) => {
	const [value, setValue] = useState(defaultChecked);

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const { checked } = event.target;

		if (checked !== value) {
			setValue(checked);
			onChange(checked);
		}
	}

	return (
		<div className="c-checkbox">
			<label>
				<input
					type="checkbox"
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
