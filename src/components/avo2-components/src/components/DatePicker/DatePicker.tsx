import React, { ChangeEvent, FunctionComponent } from 'react';

import { Icon } from '../Icon/Icon';

export interface DatePickerProps {
	id?: string;
	disabled?: boolean;
	placeholder?: string;
	value?: Date | null;
	onChange?: (date: Date | null) => void;
}

export const DatePicker: FunctionComponent<DatePickerProps> = ({
	id,
	disabled = false,
	placeholder = 'dd/mm/yyyy',
	value,
	onChange = () => {},
}: DatePickerProps) => {
	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const val = event.target.value;

		if (val) {
			onChange(new Date(val));
		} else {
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
