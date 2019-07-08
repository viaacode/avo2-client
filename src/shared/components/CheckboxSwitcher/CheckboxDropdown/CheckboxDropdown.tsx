import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	Checkbox,
	CheckboxGroup,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Icon,
	Spacer,
	TagList,
} from '@viaa/avo2-components';
import { compact, fromPairs } from 'lodash-es';
import { CheckboxOption } from '../CheckboxSwitcher';

export interface CheckboxDropdownProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

export interface CheckboxDropdownState {
	checkedStates: { [checkboxId: string]: boolean };
	isDropdownOpen: boolean;
}

export const CheckboxDropdown: FunctionComponent<CheckboxDropdownProps> = ({
	label,
	id,
	options,
	disabled,
	onChange,
}: CheckboxDropdownProps) => {
	const [checkedStates, setCheckedStates] = useState(
		fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
	);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleCheckboxToggled = async (checked: boolean, id: string) => {
		setCheckedStates({
			...checkedStates,
			[id]: checked,
		});
	};

	const resetCheckboxStates = () => {
		setCheckedStates(
			fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
		);
	};

	const getSelectedFilterIds = () =>
		compact(Object.keys(checkedStates).map(key => (checkedStates[key] ? key : null)));

	const getSelectedTags = (): { label: string; id: string }[] => {
		return compact(
			options.map((option: CheckboxOption) => {
				if (!checkedStates[option.id]) {
					return null;
				}
				return { label: option.label, id: option.id };
			})
		);
	};

	// const renderSelectedFilters = () => {
	// 	const tagInfos: TagInfo[] = flatten(
	// 		(Object.keys(formState) as Avo.Search.FilterProp[]).map((filterProp: Avo.Search.FilterProp) =>
	// 			getTagInfos(filterProp, formState[filterProp])
	// 		)
	// 	);
	// 	const tagLabels = tagInfos.map((tagInfo: TagInfo) => tagInfo.label);
	// 	if (tagLabels.length > 1) {
	// 		tagLabels.push('Alle filters wissen');
	// 	}
	// 	return (
	// 		<Spacer margin="bottom-large">
	// 			<TagList
	// 				closable={true}
	// 				swatches={false}
	// 				onTagClosed={async (tagLabel: string) => {
	// 					if (tagLabel === 'Alle filters wissen') {
	// 						deleteAllFilters();
	// 					} else {
	// 						const tagInfo = find(tagInfos, (tagInfo: TagInfo) => tagInfo.label === tagLabel);
	// 						if (tagInfo) {
	// 							await deleteFilter(tagInfo);
	// 						}
	// 					}
	// 				}}
	// 				tags={tagLabels}
	// 			/>
	// 		</Spacer>
	// 	);
	// };

	const applyFilter = async (): Promise<void> => {
		onChange(getSelectedFilterIds(), id);
		await closeDropdown();
	};

	const openDropdown = async () => {
		await resetCheckboxStates();
		setIsDropdownOpen(true);
	};

	const closeDropdown = async () => {
		setIsDropdownOpen(false);
	};

	return (
		<div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
			<Dropdown
				label={label}
				autoSize={true}
				isOpen={isDropdownOpen}
				onOpen={openDropdown}
				onClose={closeDropdown}
			>
				<DropdownButton>
					<button className="c-button c-button--secondary">
						<div className="c-button__content">
							<div className="c-button__label">{label}</div>
							<TagList tags={getSelectedTags()} />
							<Icon name={isDropdownOpen ? 'caret-up' : 'caret-down'} size="small" type="arrows" />
						</div>
					</button>
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<FormGroup label={label} labelFor={id}>
								<CheckboxGroup>
									{options.map((option: CheckboxOption) => (
										<Checkbox
											key={`checkbox-${id}-${option.id}`}
											id={option.id}
											label={
												option.optionCount
													? `${option.label} (${option.optionCount})`
													: option.label
											}
											checked={checkedStates[option.id]}
											onChange={(checked: boolean) => handleCheckboxToggled(checked, option.id)}
										/>
									))}
								</CheckboxGroup>
							</FormGroup>
							<FormGroup>
								<Button
									label="Toepassen"
									type="primary"
									block={true}
									onClick={() => applyFilter()}
								/>
							</FormGroup>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		</div>
	);
};
