import React, { ChangeEvent, FunctionComponent, useState } from 'react';

import { Icon } from '../Icon/Icon';

export interface TextInputProps {
	id?: string;
	disabled?: boolean;
	placeholder?: string;
	defaultValue?: string;
	icon?: string;
	onChange?: (value: string) => void;
}

export const TextInput: FunctionComponent<TextInputProps> = ({
	id,
	disabled = false,
	placeholder,
	defaultValue = '',
	icon,
	onChange = () => {},
}: TextInputProps) => {
	const [value, setValue] = useState(defaultValue);

	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		const { value: val } = event.target;

		if (val !== value) {
			setValue(val);
			onChange(val);
		}
	}

	return icon ? (
		<div className="c-input-with-icon">
			<input
				className="c-input"
				type="text"
				id={id}
				value={value}
				disabled={disabled}
				placeholder={placeholder}
				onChange={onValueChange}
			/>
			<Icon name={icon} />
		</div>
	) : (
		<input
			className="c-input"
			type="text"
			id={id}
			value={value}
			disabled={disabled}
			placeholder={placeholder}
			onChange={onValueChange}
		/>
	);
};
