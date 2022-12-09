import { Flex, Spacer } from '@viaa/avo2-components';
import clsx from 'clsx';
import React, { FunctionComponent, ReactNode } from 'react';
import Select, { Props } from 'react-select';

import './ColorSelect.scss';
import { ReactSelectOption } from '../../../../shared/types';

export interface ColorOption {
	label: string;
	value: string;
	color?: string; // Defaults to value for the hex color code
}

export interface ColorSelectProps extends Props {
	options: ColorOption[];
}

export const ColorSelect: FunctionComponent<ColorSelectProps> = ({
	className,
	noOptionsMessage = ({ inputValue }) => `Geen kleuren gevonden: ${inputValue}`,
	placeholder = '',
	options,
	...rest
}) => {
	const renderLabel = ({ label, value }: ReactSelectOption<string>): ReactNode => {
		const option: ColorOption | undefined = options.find((option) => option.value === value);
		return (
			<div key={`color-select-${label}-${value}`}>
				<Flex>
					{!!option && (
						<div
							className={`c-color-select__preview`}
							style={{ backgroundColor: option.color || option.value }}
						/>
					)}
					{!!label && <Spacer margin="left-small">{label}</Spacer>}
				</Flex>
			</div>
		);
	};

	return (
		<Select
			className={clsx(className, 'c-color-select')}
			noOptionsMessage={noOptionsMessage}
			placeholder={placeholder}
			options={options}
			{...rest}
			classNamePrefix="react-select"
			formatOptionLabel={(data: unknown) => renderLabel(data as ReactSelectOption<string>)}
		/>
	);
};
