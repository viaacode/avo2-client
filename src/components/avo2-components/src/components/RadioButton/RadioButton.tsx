import React, { ChangeEvent, FunctionComponent, useState } from 'react';

import { useDeselectEvent } from '../../hooks/useDeselectEvent';

export interface RadioButtonProps {
	label: string;
	name: string;
	value: string;
	id?: string;
	disabled?: boolean;
	defaultChecked?: boolean;
	onChange?: (checked: boolean) => void;
}

export const RadioButton: FunctionComponent<RadioButtonProps> = ({
	label,
	name,
	value,
	id,
	disabled = false,
	defaultChecked = false,
	onChange = () => {},
}: RadioButtonProps) => {
	const [checked, setChecked] = useState(defaultChecked);
	const [dispatchDeselectEvent] = useDeselectEvent(name, value, onDeselect);

	function onDeselect() {
		if (checked) {
			setChecked(false);
			onChange(false);
		}
	}

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const { checked: checkedValue } = event.target;

		dispatchDeselectEvent();

		if (checkedValue !== checked) {
			setChecked(checkedValue);
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
