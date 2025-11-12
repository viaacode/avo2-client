import {Alert, Select, Spacer} from '@viaa/avo2-components';
import {type Avo} from '@viaa/avo2-types';
import {clsx} from 'clsx';
import {remove, uniq} from 'es-toolkit';
import React, {type FC, useEffect, useState} from 'react';

import {CustomError} from '../../helpers/custom-error.js';
import {stringsToTagList} from '../../helpers/strings-to-taglist.js';
import {tHtml} from '../../helpers/translate-html.js';
import {tText} from '../../helpers/translate-text.js';
import {EducationOrganisationService} from '../../services/education-organizations-service.js';
import {ToastService} from '../../services/toast-service.js';

import './EducationalOrganisationsSelect.scss';
import {pullAllBy} from "es-toolkit/compat";

interface EducationalOrganisationsSelectProps {
	organisations: Avo.EducationOrganization.Organization[];
	onChange: (organisations: Avo.EducationOrganization.Organization[]) => void;
	disabled?: boolean;
	showSelectedValuesOnCollapsed?: boolean;
}

export const EducationalOrganisationsSelect: FC<EducationalOrganisationsSelectProps> = ({
	organisations,
	onChange,
	disabled = false,
}) => {
	const [cities, setCities] = useState<string[]>([]);
	const [organisationsInCity, setOrganisationsInCity] = useState<
		Avo.EducationOrganization.Organization[]
	>([]);
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
					tHtml('settings/components/organisation___het-ophalen-van-de-steden-is-mislukt')
				);
			});
	}, [setCities]);

	useEffect(() => {
		(async () => {
			try {
				if (!selectedCity) {
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
				pullAllBy(orgs, organisations, 'organisationLabel');
				setOrganisationsInCity(orgs);
				setOrganizationsLoadingState('loaded');
			} catch (err) {
				setOrganisationsInCity([]);
				setOrganizationsLoadingState('loaded');
				console.error('Failed to get educational organizations', err, {
					selectedCity,
				});
				ToastService.danger(
					tHtml(
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
		tText,
		tHtml,
	]);

	const onSelectedCityChanged = async (cityAndZipCode: string) => {
		setSelectedCity(cityAndZipCode);
	};

	const onSelectedOrganisationChanged = (orgLabel: string) => {
		const selectedOrg = organisationsInCity.find(
			(org: Avo.EducationOrganization.Organization) => org.organisationLabel === orgLabel
		);
		if (!selectedOrg) {
			ToastService.danger(
				tHtml(
					'settings/components/organisation___de-geselecteerde-instelling-kon-niet-worden-gevonden'
				)
			);
			return;
		}
		const selectedOrgs: Avo.EducationOrganization.Organization[] = [
			...organisations,
			...[selectedOrg],
		];
		onChange(uniq(selectedOrgs));
	};

	const removeOrganisation = async (orgLabel: string | number) => {
		const newOrganizations = [...organisations];
		remove(newOrganizations, (org) => getOrganisationDisplayLabel(org) === orgLabel);
		onChange(newOrganizations);
	};

	const getOrganisationOptions = () => {
		if (organisationsInCity.length === 0 && organizationsLoadingState === 'loaded') {
			return [
				{
					label: tText(
						'settings/components/organisation___er-zijn-geen-andere-organisaties-gekend-in-deze-gemeente'
					),
					value: '',
					disabled: true,
				},
			];
		}
		return [
			{
				label: tText('settings/components/organisation___selecteer-een-instelling'),
				value: '',
				disabled: true,
			},
			...organisationsInCity.map((org: Avo.EducationOrganization.Organization) => ({
				label:
					org.organisationLabel + (org.unitStreet ? ' - ' + (org.unitStreet || '') : ''),
				value: org.organisationLabel,
			})),
		];
	};

	const getOrganisationDisplayLabel = (org: Avo.EducationOrganization.Organization) =>
		org.organisationLabel + (org.unitStreet ? ' - ' + (org.unitStreet || '') : '');

	const renderOrganisationTagsAndSelects = () => {
		return (
			<>
				{stringsToTagList(
					organisations,
					getOrganisationDisplayLabel,
					undefined,
					removeOrganisation
				)}
				<Spacer margin="top-small">
					<Select
						options={[
							{
								label: tText(
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
							message={tText(
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
			</>
		);
	};

	if (disabled) {
		return (
			<div className={clsx({ 'u-opacity-50 u-disable-click': disabled })}>
				{renderOrganisationTagsAndSelects()}
			</div>
		);
	}

	return renderOrganisationTagsAndSelects();
};
