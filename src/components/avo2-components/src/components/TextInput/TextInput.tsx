import React, { ChangeEvent, FunctionComponent } from 'react';

import { Icon } from '../Icon/Icon';

export interface TextInputProps {
	id?: string;
	disabled?: boolean;
	placeholder?: string;
	value?: string;
	icon?: string;
	onChange?: (value: string) => void;
}

export const TextInput: FunctionComponent<TextInputProps> = ({
	id,
	disabled = false,
	placeholder,
	value = '',
	icon,
	onChange = () => {},
}: TextInputProps) => {
	function onValueChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.value);
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
