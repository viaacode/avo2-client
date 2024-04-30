import { type TagInfo } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import { groupBy, map } from 'lodash-es';
import React, { type FC } from 'react';
import Select from 'react-select';

import './MultiThemeSelectDropdown.scss';
import MultiThemeSelectOptionGroupHeading from './MultiThemeSelectOptionGroupHeading';

interface MultiThemeSelectDropdownProps {
	id?: string;
	value: TagInfo[];
	allThemes: Avo.Lom.LomField[];
	isLoading: boolean;
	onChange: (newThemes: TagInfo[]) => void;
	placeholder?: string;
}

const MultiThemeSelectDropdown: FC<MultiThemeSelectDropdownProps> = ({
	id,
	value,
	allThemes,
	isLoading,
	onChange,
	placeholder,
}) => {
	const groupedThemes = groupBy(allThemes, 'broader');
	const { null: categories, ...themeGroups } = groupedThemes;
	const themeOptions = map(themeGroups, (themeGroup, categoryId) => ({
		label: (categories || []).find((category) => category.id === categoryId)?.label,
		options: themeGroup.map((theme) => ({ label: theme.label, value: theme.id })),
	}));

	return (
		<Select
			id={id}
			value={value}
			options={themeOptions || []}
			blurInputOnSelect={false}
			closeMenuOnSelect={true}
			components={{ GroupHeading: MultiThemeSelectOptionGroupHeading }}
			className={classnames('c-multi-theme-select', 'c-tags-input')}
			classNamePrefix="c-tags-input"
			onChange={(newValue) => onChange(newValue as TagInfo[])}
			isMulti
			isLoading={isLoading}
			placeholder={placeholder || null}
		/>
	);
};

export default MultiThemeSelectDropdown;
