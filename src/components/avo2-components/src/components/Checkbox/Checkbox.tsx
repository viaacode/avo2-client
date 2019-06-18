import React, { ChangeEvent, FunctionComponent } from 'react';

export interface CheckboxProps {
	label: string;
	checked?: boolean;
	id?: string;
	disabled?: boolean;
	onChange?: (checked: boolean) => void;
}

export const Checkbox: FunctionComponent<CheckboxProps> = ({
	label,
	id,
	disabled = false,
	checked = false,
	onChange = () => {},
}: CheckboxProps) => {
	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const currentCheckedValue = event.target.checked;

		if (currentCheckedValue !== checked) {
			onChange(currentCheckedValue);
		}
	}

	return (
		<div className="c-checkbox">
			<label>
				<input
					type="checkbox"
					id={id}
					checked={checked}
					disabled={disabled}
					onChange={onValueChange}
				/>
				{label}
			</label>
		</div>
	);
};
