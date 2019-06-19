import React, { ChangeEvent, FunctionComponent, useState } from 'react';

import { Icon } from '../Icon/Icon';

export interface DatePickerProps {
	id?: string;
	disabled?: boolean;
	placeholder?: string;
	defaultValue?: Date | null;
	onChange?: (date: Date | null) => void;
}

export const DatePicker: FunctionComponent<DatePickerProps> = ({
	id,
	disabled = false,
	placeholder = 'dd/mm/yyyy',
	defaultValue,
	onChange = () => {},
}: DatePickerProps) => {
	const [value, setValue] = useState(defaultValue);

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const { value: val } = event.target;

		if (val) {
			const date = new Date(val);

			if (!value || date.valueOf() !== value.valueOf()) {
				setValue(date);
				onChange(date);
			}
		} else {
			setValue(null);
			onChange(null);
		}
	}

	function getValue(date: Date | null | undefined) {
		return date ? date.toISOString().slice(0, 'yyyy-mm-dd'.length) : '';
	}

	return (
		<div className="c-input-with-icon">
			<input
				className="c-input"
				type="date"
				id={id}
				value={getValue(value)}
				disabled={disabled}
				placeholder={placeholder}
				onChange={onValueChange}
			/>
			<Icon name="calendar" />
		</div>
	);
};
