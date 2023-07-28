import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import { LomFieldSchema } from '@viaa/avo2-types/types/lom';
import classnames from 'classnames';
import { groupBy, map } from 'lodash-es';
import React, { FC } from 'react';
import Select from 'react-select';

import './MultiThemeSelectDropdown.scss';
import MultiThemeSelectOptionGroupHeading from './MultiThemeSelectOptionGroupHeading';

interface MultiThemeSelectDropdownProps {
	value: TagInfoSchema[];
	allThemes: LomFieldSchema[];
	isLoading: boolean;
	onChange: (newThemes: TagInfoSchema[]) => void;
	placeholder?: string;
}

const MultiThemeSelectDropdown: FC<MultiThemeSelectDropdownProps> = ({
	value,
	allThemes,
	isLoading,
	onChange,
	placeholder,
}) => {
	const groupedThemes = groupBy(allThemes, 'broader');
	const { null: categories, ...themeGroups } = groupedThemes;
	const themeOptions = map(themeGroups, (themeGroup, categoryId) => ({
		label: categories.find((category) => category.id === categoryId)?.label,
		options: themeGroup.map((theme) => ({ label: theme.label, value: theme.id })),
	}));

	return (
		<Select
			value={value}
			options={themeOptions || []}
			blurInputOnSelect={false}
			closeMenuOnSelect={true}
			components={{ GroupHeading: MultiThemeSelectOptionGroupHeading }}
			className={classnames('c-multi-theme-select', 'c-tags-input')}
			classNamePrefix="c-tags-input"
			onChange={(newValue) => onChange(newValue as TagInfoSchema[])}
			isMulti
			isLoading={isLoading}
			placeholder={placeholder || null}
		/>
	);
};

export default MultiThemeSelectDropdown;
