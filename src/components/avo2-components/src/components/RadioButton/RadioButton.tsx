import React, { ChangeEvent, FunctionComponent } from 'react';

import { useDeselectEvent } from '../../hooks/useDeselectEvent';

export interface RadioButtonProps {
	label: string;
	name: string;
	value: string;
	id?: string;
	disabled?: boolean;
	checked?: boolean;
	onChange?: (checked: boolean) => void;
}

export const RadioButton: FunctionComponent<RadioButtonProps> = ({
	label,
	name,
	value,
	id,
	disabled = false,
	checked = false,
	onChange = () => {},
}: RadioButtonProps) => {
	const [dispatchDeselectEvent] = useDeselectEvent(name, value, onDeselect);

	function onDeselect() {
		if (checked) {
			onChange(false);
		}
	}

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const checkedValue = event.target.checked;

		dispatchDeselectEvent();

		if (checkedValue !== checked) {
			onChange(checkedValue);
		}
	}

	return (
		<div className="c-radio">
			<label>
				<input
					type="radio"
					name={name}
					value={value}
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
