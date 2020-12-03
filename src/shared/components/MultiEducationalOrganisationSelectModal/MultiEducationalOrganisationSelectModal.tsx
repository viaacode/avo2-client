import classnames from 'classnames';
import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Icon, Modal, ModalBody, ModalFooterRight, TagList } from '@viaa/avo2-components';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { EducationalOrganisationsSelect } from '../EducationalOrganisationsSelect/EducationalOrganisationsSelect';

import './MultiEducationalOrganisationSelectModal.scss';

export interface Tag {
	label: string;
	id: string;
}

export interface MultiEducationalOrganisationSelectModalProps {
	label: string;
	id: string;
	values: ClientEducationOrganization[];
	disabled?: boolean;
	onChange: (organisations: string[], id: string) => void;
	showSelectedValuesOnCollapsed?: boolean;
}

export const MultiEducationalOrganisationSelectModal: FunctionComponent<MultiEducationalOrganisationSelectModalProps> = ({
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

	useEffect(() => {
		setSelectedOrganisations(values);
	}, [isOpen, values]);

	const closeModal = () => {
		setIsOpen(false);
	};

	const applyFilter = () => {
		onChange(
			selectedOrganisations.map((org) => `${org.organizationId}:${org.unitId || ''}`),
			id
		);
		closeModal();
	};

	// @ts-ignore
	const deleteAllSelectedOrganisations = (tagId: string | number, clickEvent: MouseEvent) => {
		setSelectedOrganisations([]);
		onChange([], id);
		clickEvent.stopPropagation();
	};

	const renderCheckboxControl = () => {
		return (
			<>
				<div>
					<Button
						autoHeight
						className="c-checkbox-dropdown-modal__trigger"
						type="secondary"
						onClick={() => setIsOpen(!isOpen)}
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
				</div>
				<Modal
					isOpen={isOpen}
					onClose={closeModal}
					title={t('Educatieve organisaties')}
					size={'medium'}
				>
					<ModalBody>
						<EducationalOrganisationsSelect
							organisations={selectedOrganisations}
							onChange={setSelectedOrganisations}
						/>
					</ModalBody>
					<ModalFooterRight>
						<Button
							label={t(
								'shared/components/checkbox-dropdown-modal/checkbox-dropdown-modal___toepassen'
							)}
							type="primary"
							className="c-apply-filter-button"
							block
							onClick={applyFilter}
						/>
					</ModalFooterRight>
				</Modal>
			</>
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
