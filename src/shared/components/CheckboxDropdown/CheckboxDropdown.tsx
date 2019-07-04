import React, { FunctionComponent, useState } from 'react';

import { Button, Checkbox, CheckboxGroup, Dropdown, Form, FormGroup } from '@viaa/avo2-components';
import { compact, fromPairs } from 'lodash-es';

export interface CheckboxOption {
	label: string;
	id: string;
	checked: boolean;
}

export interface CheckboxDropdownProps {
	label: string;
	id: string;
	options: CheckboxOption[];
	collapsedItemCount?: number;
	disabled?: boolean;
	onChange: (checkedOptions: string[], id: string) => void;
}

export interface CheckboxDropdownState {
	checkedStates: { [checkboxId: string]: boolean };
	showCollapsed: boolean;
	isDropdownOpen: boolean;
}

export const CheckboxDropdown: FunctionComponent<CheckboxDropdownProps> = ({
	label,
	id,
	options,
	collapsedItemCount,
	disabled,
	onChange,
}: CheckboxDropdownProps) => {
	const [checkedStates, setCheckedStates] = useState(
		fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
	);
	const [showCollapsed, setShowCollapsed] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleCheckboxToggled = async (checked: boolean, id: string) => {
		setCheckedStates({
			...checkedStates,
			[id]: checked,
		});
	};

	const handleShowCollapsedClick = () => {
		setShowCollapsed(!showCollapsed);
	};

	const resetCheckboxStates = () => {
		setCheckedStates(
			fromPairs(options.map((option: CheckboxOption) => [option.id, option.checked]))
		);
	};

	const applyFilter = async (): Promise<void> => {
		onChange(compact(Object.keys(checkedStates).map(key => (checkedStates[key] ? key : null))), id);
		await closeDropdown();
	};

	const openDropdown = async () => {
		await resetCheckboxStates();
		setIsDropdownOpen(true);
	};

	const closeDropdown = async () => {
		setIsDropdownOpen(false);
	};

	const splitCount = collapsedItemCount || Math.min(options.length, 10);
	const showExpandToggle = splitCount < options.length;

	return (
		<div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
			<Dropdown
				label={label}
				autoSize={true}
				isOpen={isDropdownOpen}
				onOpen={openDropdown}
				onClose={closeDropdown}
			>
				<div className="u-spacer">
					<Form>
						<FormGroup label={label} labelFor={id}>
							<CheckboxGroup>
								{options.map(
									(option: CheckboxOption, index: number) =>
										(index < splitCount || showCollapsed) && (
											<Checkbox
												key={`checkbox-${id}-${option.id}`}
												id={option.id}
												label={option.label}
												checked={checkedStates[option.id]}
												onChange={(checked: boolean) => handleCheckboxToggled(checked, option.id)}
											/>
										)
								)}
								{showExpandToggle && (
									// eslint-disable-next-line jsx-a11y/anchor-is-valid
									<a className="c-link-toggle" onClick={handleShowCollapsedClick}>
										<div className="c-link-toggle__label u-spacer-bottom">
											{showCollapsed ? 'Toon minder' : 'Toon meer'}
										</div>
									</a>
								)}
							</CheckboxGroup>
						</FormGroup>
						<FormGroup>
							<Button label="Toepassen" type="primary" block={true} onClick={() => applyFilter()} />
						</FormGroup>
					</Form>
				</div>
			</Dropdown>
		</div>
	);
};
