import { Flex, Icon, IconName, Spacer } from '@viaa/avo2-components';
import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import Select, { Props } from 'react-select';

import { ReactSelectOption } from '../../../../shared/types';

import './IconPicker.scss';

type IconPickerProps = Props;

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
