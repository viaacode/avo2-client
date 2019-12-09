import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import Select, { Props } from 'react-select';

import { Flex, Spacer } from '@viaa/avo2-components';

import { ReactSelectOption } from '../../../../shared/types';

import './ColorSelect.scss';

interface ColorSelectProps extends Props {}

const ColorSelect: FunctionComponent<ColorSelectProps> = ({
	className,
	noOptionsMessage = ({ inputValue }) => `Geen kleuren gevonden: ${inputValue}`,
	placeholder = '',
	...rest
}) => {
	const renderLabel = ({ label, value }: ReactSelectOption<string>) => (
		<Flex>
			<div className={`c-color-select__preview u-bg-${value}`} />
			<Spacer margin="left-small">{label}</Spacer>
		</Flex>
	);

	return (
		<Select
			className={classnames(className, 'c-color-select')}
			noOptionsMessage={noOptionsMessage}
			placeholder={placeholder}
			{...rest}
			classNamePrefix="react-select"
			formatOptionLabel={renderLabel}
		/>
	);
};

export default ColorSelect;
