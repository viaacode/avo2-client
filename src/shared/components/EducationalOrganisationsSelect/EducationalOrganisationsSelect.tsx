import classnames from 'classnames';
import { pullAllBy, remove, uniq } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Alert,
	Button,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	Select,
	Spacer,
	TagList,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { ClientEducationOrganization } from '@viaa/avo2-types/types/education-organizations';

import { CustomError } from '../../helpers';
import { ToastService } from '../../services';
import { EducationOrganisationService } from '../../services/education-organizations-service';

import './EducationalOrganisationsSelect.scss';

export interface Tag {
	label: string;
	id: string;
}

export interface EducationalOrganisationsSelectProps {
	organisations: ClientEducationOrganization[];
	onChange: (organisations: ClientEducationOrganization[]) => void;
	disabled?: boolean;
	showSelectedValuesOnCollapsed?: boolean;
}

export const EducationalOrganisationsSelect: FunctionComponent<EducationalOrganisationsSelectProps> = ({
	organisations,
	onChange,
	disabled = false,
}) => {
	const [t] = useTranslation();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [cities, setCities] = useState<string[]>([]);
	const [organisationsInCity, setOrganisationsInCity] = useState<ClientEducationOrganization[]>(
		[]
	);
	const [selectedCity, setSelectedCity] = useState<string>('');
	const [organizationsLoadingState, setOrganizationsLoadingState] = useState<
		'loading' | 'loaded' | 'error'
	>('loaded');

	// Cache organizations since the user will probably select multiple schools in the same city
	const [organisationsCache, setOrganisationsCache] = useState<{
		[cityAndZipCode: string]: Avo.EducationOrganization.Organization[];
	}>({});

	useEffect(() => {
		EducationOrganisationService.fetchCities()
			.then(setCities)
			.catch((err) => {
				console.error(new CustomError('Failed to get cities', err));
				ToastService.danger(
					t('settings/components/organisation___het-ophalen-van-de-steden-is-mislukt')
				);
			});
	}, [setCities, t]);

	useEffect(() => {
		(async () => {
			try {
				if (!selectedCity) {
					onChange([] as Avo.EducationOrganization.Organization[]);
					return;
				}
				setOrganizationsLoadingState('loading');
				const [city, zipCode] = selectedCity.split(/[()]/g).map((s) => s.trim());
				let orgs: Avo.EducationOrganization.Organization[];
				if (organisationsCache[selectedCity]) {
					// get from cache
					orgs = [...organisationsCache[selectedCity]];
				} else {
					// fetch from server
					orgs = await EducationOrganisationService.fetchEducationOrganisations(
						city,
						zipCode
					);
					setOrganisationsCache({
						...organisationsCache,
						...{ [selectedCity]: orgs },
					});
				}
				pullAllBy(orgs, organisations, 'label');
				setOrganisationsInCity(orgs);
				setOrganizationsLoadingState('loaded');
			} catch (err) {
				setOrganisationsInCity([]);
				setOrganizationsLoadingState('loaded');
				console.error('Failed to get educational organizations', err, {
					selectedCity,
				});
				ToastService.danger(
					t(
						'settings/components/organisation___het-ophalen-van-de-onderwijsinstellingen-is-mislukt'
					)
				);
			}
		})();
	}, [
		organisationsCache,
		organisations,
		selectedCity,
		setOrganisationsInCity,
		setOrganizationsLoadingState,
		onChange,
		t,
	]);

	const onSelectedCityChanged = async (cityAndZipCode: string) => {
		setSelectedCity(cityAndZipCode);
	};

	const onSelectedOrganisationChanged = (orgLabel: string) => {
		const selectedOrg = organisations.find(
			(org: ClientEducationOrganization) => org.label === orgLabel
		);
		if (!selectedOrg) {
			ToastService.danger(
				t(
					'settings/components/organisation___de-geselecteerde-instelling-kon-niet-worden-gevonden'
				)
			);
			return;
		}
		const selectedOrgs: ClientEducationOrganization[] = [...organisations, ...[selectedOrg]];
		onChange(uniq(selectedOrgs));
	};

	const removeOrganisation = async (orgLabel: ReactText) => {
		const newOrganizations = [...organisations];
		remove(newOrganizations, (org) => org.label === orgLabel);
		onChange(newOrganizations);
	};

	const getOrganisationOptions = () => {
		if (organisationsInCity.length === 0 && organizationsLoadingState === 'loaded') {
			return [
				{
					label: t(
						'settings/components/organisation___er-zijn-geen-andere-organisaties-gekend-in-deze-gemeente'
					),
					value: '',
					disabled: true,
				},
			];
		}
		return [
			{
				label: t('settings/components/organisation___selecteer-een-instelling'),
				value: '',
				disabled: true,
			},
			...organisationsInCity.map((org: Avo.EducationOrganization.Organization) => ({
				label: org.label,
				value: org.label,
			})),
		];
	};

	const closeDropdown = () => {
		onChange([]);
		setIsOpen(false);
	};

	const deleteAllSelectedOrgs = () => {
		onChange([]);
		onChange([]);
	};

	const renderCheckboxControl = () => {
		return (
			<Dropdown
				label={t('Educatieve organisaties')}
				menuClassName="c-educationalOrganisation-dropdown__menu"
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
							<div className="c-button__label">{t('Educatieve organisaties')}</div>
							{!!organisations.length && (
								<TagList
									tags={[
										{
											id: 'educationalOrganisations',
											label: `${organisations.length} ${
												organisations.length > 1
													? t('Educatieve organisaties')
													: t('Educatieve organisatie')
											}`,
										},
									]}
									swatches={false}
									closable
									onTagClosed={deleteAllSelectedOrgs}
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
					<TagList
						closable
						swatches={false}
						tags={organisations.map((org: ClientEducationOrganization) => ({
							label: org.label,
							id: org.label,
						}))}
						onTagClosed={removeOrganisation}
					/>
					<Spacer margin="top-small">
						<Select
							options={[
								{
									label: t(
										'settings/components/profile___voeg-een-organisatie-toe'
									),
									value: '',
								},
								...(cities || []).map((c) => ({ label: c, value: c })),
							]}
							value={selectedCity || ''}
							onChange={onSelectedCityChanged}
						/>
					</Spacer>
					<Spacer margin={['top-small', 'bottom-small']}>
						{organizationsLoadingState === 'loading' && (
							<Alert
								type="spinner"
								message={t(
									'settings/components/profile___bezig-met-ophalen-van-organisaties'
								)}
							/>
						)}
						{!!selectedCity && organizationsLoadingState === 'loaded' && (
							<Select
								options={getOrganisationOptions()}
								value={''}
								onChange={onSelectedOrganisationChanged}
							/>
						)}
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
