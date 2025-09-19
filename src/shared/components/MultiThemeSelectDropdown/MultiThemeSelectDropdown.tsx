import { type TagInfo } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { groupBy, map } from 'lodash-es';
import React, { type FC } from 'react';
import Select from 'react-select';

import MultiThemeSelectOptionGroupHeading from './MultiThemeSelectOptionGroupHeading';

import './MultiThemeSelectDropdown.scss';

interface MultiThemeSelectDropdownProps {
	id?: string;
	value: TagInfo[];
	allThemes: Avo.Lom.LomField[];
	isLoading: boolean;
	onChange: (newThemes: TagInfo[]) => void;
	placeholder?: string;
	allowMulti?: boolean;
}

export const MultiThemeSelectDropdown: FC<MultiThemeSelectDropdownProps> = ({
	id,
	value,
	allThemes,
	isLoading,
	onChange,
	placeholder,
	allowMulti = true,
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
			className={clsx('c-multi-theme-select', 'c-tags-input')}
			classNamePrefix="c-tags-input"
			onChange={(newValue) => onChange(newValue as TagInfo[])}
			isMulti={allowMulti}
			isLoading={isLoading}
			placeholder={placeholder || null}
		/>
	);
};
