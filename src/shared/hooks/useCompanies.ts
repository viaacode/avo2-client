import { useEffect, useState } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers/custom-error';
import { OrganisationService } from '../services/organizations-service';
import { ToastService } from '../services/toast-service';

export type BasicOrganisation = {
	or_id: string;
	name: string;
};

type UseCompaniesTuple = [BasicOrganisation[], boolean];

export const useCompanies = (onlyWithItems: boolean): UseCompaniesTuple => {
	const { tHtml } = useTranslation();

	const [companies, setCompanies] = useState<BasicOrganisation[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		OrganisationService.fetchOrganisations(onlyWithItems)
			.then((orgs) => {
				if (orgs) {
					setCompanies(
						orgs.filter((org) => org.name && org.or_id) as BasicOrganisation[]
					);
				}
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get organisations from database', err));
				ToastService.danger(
					tHtml(
						'settings/components/profile___het-ophalen-van-de-organisaties-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tHtml, onlyWithItems]);

	return [companies, isLoading];
};

export const useCompaniesWithUsers = (): UseCompaniesTuple => {
	const { tHtml } = useTranslation();

	const [companies, setCompanies] = useState<BasicOrganisation[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		OrganisationService.fetchOrganisationsWithUsers()
			.then((orgs) => {
				if (orgs) {
					setCompanies(
						orgs.filter((org) => org.name && org.or_id) as BasicOrganisation[]
					);
				}
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get organisations from database', err));
				ToastService.danger(
					tHtml(
						'settings/components/profile___het-ophalen-van-de-organisaties-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tHtml]);

	return [companies, isLoading];
};
