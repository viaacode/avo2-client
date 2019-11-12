import React, { FunctionComponent } from 'react';
import Select from 'react-select';
import { Props } from 'react-select/src/Select';

import { Flex, Icon, IconName, Spacer } from '@viaa/avo2-components';
import classnames from 'classnames';

import { ReactSelectOption } from '../../../shared/types/types';

import './IconPicker.scss';

interface IconPickerProps extends Props {}

export const IconPicker: FunctionComponent<IconPickerProps> = ({
	className,
	isClearable = true,
	isSearchable = true,
	noOptionsMessage = ({ inputValue }) => `Geen iconen gevonden: ${inputValue}`,
	placeholder = '',
	...rest
}) => {
	const renderLabel = ({ label, value }: ReactSelectOption<string>) => (
		<Flex>
			<Icon name={value as IconName} />
			<Spacer margin="left">{label}</Spacer>
		</Flex>
	);

	return (
		<Select
			className={classnames(className, 'c-icon-picker')}
			isClearable={isClearable}
			isSearchable={isSearchable}
			noOptionsMessage={noOptionsMessage}
			placeholder={placeholder}
			{...rest}
			classNamePrefix="react-select"
			formatOptionLabel={renderLabel}
		/>
	);
};
