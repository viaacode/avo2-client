import { get, isNull } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { ActionMeta, ValueType } from 'react-select/src/types';

import { Button, Flex, FlexItem, FormGroup, LinkTarget, TextInput } from '@viaa/avo2-components';

import { CustomError } from '../../../../shared/helpers';
import { ToastService } from '../../../../shared/services';
import { parseSearchQuery } from '../../helpers/content-picker/parse-picker';
import { ContentPickerType, PickerItem, PickerSelectItem, PickerTypeOption } from '../../types';

import {
	DEFAULT_ALLOWED_TYPES,
	GET_CONTENT_TYPES,
	REACT_SELECT_DEFAULT_OPTIONS,
} from './ContentPicker.const';
import { filterTypes, setInitialInput, setInitialItem } from './ContentPicker.helpers';
import './ContentPicker.scss';

export interface ContentPickerProps {
	allowedTypes?: ContentPickerType[];
	initialValue?: PickerItem;
	onSelect: (value: PickerItem | null) => void;
	hideTypeDropdown?: boolean;
	hideTargetSwitch?: boolean;
	errors?: string | string[];
}

export const ContentPicker: FunctionComponent<ContentPickerProps> = ({
	allowedTypes = DEFAULT_ALLOWED_TYPES,
	initialValue,
	onSelect,
	hideTypeDropdown = false,
	hideTargetSwitch = false,
	errors = [],
}) => {
	const [t] = useTranslation();

	// filter available options for the type picker
	const typeOptions = filterTypes(GET_CONTENT_TYPES(), allowedTypes as ContentPickerType[]);

	// apply initial type from `initialValue`, default to first available type
	const currentTypeObject = typeOptions.find(type => type.value === get(initialValue, 'type'));
	const [selectedType, setSelectedType] = useState<PickerTypeOption<ContentPickerType>>(
		currentTypeObject || typeOptions[0]
	);

	// available options for the item picker.
	const [itemOptions, setItemOptions] = useState<PickerSelectItem[]>([]);

	// selected option, keep track of whether initial item from `initialValue` has been applied
	const [selectedItem, setSelectedItem] = useState<ValueType<PickerItem>>();
	const [hasAppliedInitialItem, setHasAppliedInitialItem] = useState<boolean>(false);

	// apply initial input if INPUT-based type, default to ''
	const [input, setInput] = useState<string>(setInitialInput(currentTypeObject, initialValue));

	const [isTargetSelf, setIsTargetSelf] = useState<boolean>(
		(get(initialValue, 'target') || LinkTarget.Self) === LinkTarget.Self
	);

	// inflate item picker
	const fetchPickerOptions = useCallback(
		async (keyword: string | null): Promise<PickerSelectItem[]> => {
			try {
				if (!selectedType || !selectedType.fetch) {
					return []; // Search query and external link don't have a fetch function
				}
				let items: PickerSelectItem[] = await selectedType.fetch(keyword, 20);

				if (!hasAppliedInitialItem && initialValue) {
					items = [
						{
							label: get(initialValue, 'label', ''),
							value: {
								type: get(initialValue, 'type') as ContentPickerType,
								value: get(initialValue, 'value', ''),
							},
						},
						...items.filter(
							(item: PickerSelectItem) => item.label !== get(initialValue, 'label')
						),
					];
				}

				setItemOptions(items);
				if (keyword && keyword.length && get(items[0], 'value.value', null) === keyword) {
					setSelectedItem(items[0] as any);
				}
				return items;
			} catch (err) {
				throw new CustomError('[Content Picker] - Failed to inflate.', err, {
					keyword,
					selectedType,
				});
			}
		},
		[selectedType, hasAppliedInitialItem, initialValue]
	);

	// when selecting a type, reset `selectedItem` and retrieve new item options
	useEffect(() => {
		fetchPickerOptions(null);
	}, [fetchPickerOptions]);

	// during the first update of `itemOptions`, set the initial value of the item picker
	useEffect(() => {
		if (itemOptions.length && !hasAppliedInitialItem) {
			setSelectedItem(setInitialItem(itemOptions, initialValue));
			setHasAppliedInitialItem(true);
		}
	}, [itemOptions, hasAppliedInitialItem, initialValue]);

	// events
	const onSelectType = async (selected: ValueType<PickerTypeOption>) => {
		if (selectedType !== selected) {
			setSelectedType(selected as PickerTypeOption);
			setSelectedItem(null);
			propertyChanged('selectedItem', null);

			fetchPickerOptions(null);
		}
	};

	const onSelectItem = (selectedItem: ValueType<PickerItem>, event?: ActionMeta) => {
		// reset `selectedItem` when clearing item picker
		if (get(event, 'action') === 'clear') {
			propertyChanged('selectedItem', null);
			setSelectedItem(null);
			return null;
		}

		const value = get(selectedItem, 'value', null);

		// if value of selected item is `null`, throw error
		if (!get(value, 'value')) {
			propertyChanged('value', null);
			setSelectedItem(null);
			console.error(
				new CustomError('[Content Picker] - Selected item has no value.', null, {
					selectedItem,
				})
			);
			ToastService.danger(
				t(
					'admin/shared/components/content-picker/content-picker___voor-deze-content-pagina-is-geen-pad-geconfigureerd'
				),
				false
			);
			return null;
		}

		propertyChanged('selectedItem', selectedItem);

		// update `selectedItem`
		setSelectedItem(selectedItem);
	};

	const onChangeInput = (value: string) => {
		setInput(value);
		propertyChanged('value', value);
	};

	const propertyChanged = (
		prop: 'type' | 'selectedItem' | 'value' | 'target' | 'label',
		propValue: ContentPickerType | ValueType<PickerItem> | string | number | null | LinkTarget
	) => {
		let newType: ContentPickerType;
		if (prop === 'type') {
			newType = propValue as ContentPickerType;
		} else {
			newType = selectedType.value;
		}

		let newValue: string | null;
		let newLabel: string | undefined;
		if (prop === 'value') {
			newValue = propValue as string | null;
		} else if (prop === 'selectedItem') {
			newValue = get(propValue, 'value.value', null);
			newLabel = get(propValue, 'label');
		} else if (selectedType.picker === 'TEXT_INPUT') {
			newValue = input;
		} else if (selectedType.picker === 'SELECT' && selectedItem) {
			newLabel = get(selectedItem, 'label');
			newValue = get(selectedItem, 'value.value');
		} else {
			newValue = null;
		}
		if (newType === 'SEARCH_QUERY' && newValue) {
			newValue = parseSearchQuery(newValue);
		}

		let newTarget: LinkTarget;
		if (prop === 'target') {
			newTarget = propValue as LinkTarget;
		} else {
			newTarget = isTargetSelf ? LinkTarget.Self : LinkTarget.Blank;
		}

		if (isNull(newValue)) {
			onSelect(null);
		} else {
			onSelect({
				type: newType,
				value: newValue,
				target: newTarget,
				label: newLabel,
			});
		}
	};

	// render controls
	const renderTypePicker = () => (
		<ReactSelect
			{...REACT_SELECT_DEFAULT_OPTIONS}
			id="content-picker-type"
			placeholder={t('admin/shared/components/content-picker/content-picker___type')}
			aria-label={t(
				'admin/shared/components/content-picker/content-picker___selecteer-een-type'
			)}
			options={typeOptions}
			onChange={onSelectType}
			value={selectedType}
			isSearchable={false}
			isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
			noOptionsMessage={() =>
				t('admin/shared/components/content-picker/content-picker___geen-types')
			}
		/>
	);

	const renderItemControl = () => {
		if (!selectedType) {
			return null;
		}

		switch (selectedType.picker) {
			case 'SELECT':
				return renderItemPicker();
			case 'TEXT_INPUT':
				return renderTextInputPicker();
			default:
				return null;
		}
	};

	const renderItemPicker = () => (
		<AsyncSelect
			{...REACT_SELECT_DEFAULT_OPTIONS}
			id="content-picker-item"
			placeholder={t(
				'admin/shared/components/content-picker/content-picker___selecteer-een-item'
			)}
			aria-label={t(
				'admin/shared/components/content-picker/content-picker___selecteer-een-item'
			)}
			loadOptions={fetchPickerOptions}
			onChange={onSelectItem}
			value={selectedItem}
			defaultOptions={itemOptions as any} // TODO: type
			isClearable
			noOptionsMessage={() =>
				t('admin/shared/components/content-picker/content-picker___geen-resultaten')
			}
			loadingMessage={() =>
				t('admin/shared/components/content-picker/content-picker___laden')
			}
		/>
	);

	const renderTextInputPicker = () => (
		<TextInput
			value={input}
			onChange={onChangeInput}
			placeholder={get(currentTypeObject, 'placeholder')}
		/>
	);

	const renderLinkTargetControl = () => {
		return (
			<Button
				size="large"
				type={'borderless'}
				icon={isTargetSelf ? 'arrow-down-circle' : 'external-link'}
				title={
					isTargetSelf
						? t(
								'admin/shared/components/content-picker/content-picker___open-de-link-in-hetzelfde-tablad'
						  )
						: t(
								'admin/shared/components/content-picker/content-picker___open-de-link-in-een-nieuw-tabblad'
						  )
				}
				onClick={() => {
					setIsTargetSelf(!isTargetSelf);
					propertyChanged('target', isTargetSelf ? LinkTarget.Blank : LinkTarget.Self);
				}}
				disabled={!(selectedType.picker === 'TEXT_INPUT' ? input : selectedItem)}
			/>
		);
	};

	// render content picker
	return (
		<FormGroup error={errors} className="c-content-picker">
			<Flex spaced="regular">
				{!hideTypeDropdown && <FlexItem shrink>{renderTypePicker()}</FlexItem>}
				<FlexItem>{renderItemControl()}</FlexItem>
				{!hideTargetSwitch && <FlexItem shrink>{renderLinkTargetControl()}</FlexItem>}
			</Flex>
		</FormGroup>
	);
};
