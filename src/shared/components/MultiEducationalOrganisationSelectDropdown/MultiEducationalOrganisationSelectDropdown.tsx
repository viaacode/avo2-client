import classnames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Icon,
	Spacer,
	TagList,
} from '@viaa/avo2-components';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { EducationalOrganisationsSelect } from '../EducationalOrganisationsSelect/EducationalOrganisationsSelect';

import './MultiEducationalOrganisationSelectDropdown.scss';

export interface Tag {
	label: string;
	id: string;
}

export interface MultiEducationalOrganisationSelectDropdownProps {
	label: string;
	id: string;
	values: ClientEducationOrganization[];
	disabled?: boolean;
	onChange: (organisations: string[], id: string) => void;
	showSelectedValuesOnCollapsed?: boolean;
}

export const MultiEducationalOrganisationSelectDropdown: FunctionComponent<MultiEducationalOrganisationSelectDropdownProps> = ({
	label,
	id,
	values,
	disabled,
	onChange,
	showSelectedValuesOnCollapsed = true,
}) => {
	const [t] = useTranslation();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedOrganisations, setSelectedOrganisations] = useState<
		ClientEducationOrganization[]
	>(values);

	const closeDropdown = () => {
		setSelectedOrganisations([]);
		setIsOpen(false);
	};

	const applyFilter = () => {
		onChange(
			selectedOrganisations.map((org) => `${org.organizationId}:${org.unitId || ''}`),
			id
		);
		closeDropdown();
	};

	const deleteAllSelectedOrganisations = () => {
		setSelectedOrganisations([]);
		onChange([], id);
	};

	const renderCheckboxControl = () => {
		return (
			<Dropdown
				label={label}
				menuClassName="c-user-dropdown__menu"
				isOpen={isOpen}
				onOpen={() => setIsOpen(true)}
				onClose={closeDropdown}
			>
				<DropdownButton>
					<Button
						autoHeight
						className="c-checkbox-dropdown-modal__trigger"
						type="secondary"
					>
						<div className="c-button__content">
							<div className="c-button__label">{label}</div>
							{!!selectedOrganisations.length && showSelectedValuesOnCollapsed && (
								<TagList
									tags={[
										{
											id: 'users',
											label: `${selectedOrganisations.length} ${
												selectedOrganisations.length > 1
													? t('Educatieve organisaties')
													: t('Educatieve organisatie')
											}`,
										},
									]}
									swatches={false}
									closable
									onTagClosed={deleteAllSelectedOrganisations}
								/>
							)}
							<Icon
								className="c-button__icon"
								name={isOpen ? 'caret-up' : 'caret-down'}
								size="small"
								type="arrows"
							/>
						</div>
					</Button>
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<Spacer margin="bottom">
								<EducationalOrganisationsSelect
									organisations={selectedOrganisations}
									onChange={setSelectedOrganisations}
								/>
							</Spacer>

							<FormGroup>
								<Button
									label={t(
										'shared/components/checkbox-dropdown-modal/checkbox-dropdown-modal___toepassen'
									)}
									type="primary"
									className="c-apply-filter-button"
									block
									onClick={applyFilter}
								/>
							</FormGroup>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	if (disabled) {
		return (
			<div className={classnames({ 'u-opacity-50 u-disable-click': disabled })}>
				{renderCheckboxControl()}
			</div>
		);
	}

	return renderCheckboxControl();
};
