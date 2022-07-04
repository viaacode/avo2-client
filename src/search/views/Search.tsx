import {
	Container,
	Flex,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
} from '@viaa/avo2-components';
import React, { FunctionComponent, ReactText, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { JsonParam, StringParam, UrlUpdateType, useQueryParams } from 'use-query-params';

import {
	PermissionGuard,
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../authentication/components';
import { PermissionName } from '../../authentication/helpers/permission-names';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { InteractiveTour } from '../../shared/components';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import { copyToClipboard } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import { SearchFiltersAndResults } from '../components';
import './Search.scss';
import { FilterState } from '../search.types';

const Search: FunctionComponent<UserProps> = ({ user }) => {
	const [t] = useTranslation();

	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const queryParamConfig = {
		filters: JsonParam,
		orderProperty: StringParam,
		orderDirection: StringParam,
		tab: StringParam,
	};
	const [filterState, setFilterState] = useQueryParams(queryParamConfig) as [
		FilterState,
		(FilterState: FilterState, updateType?: UrlUpdateType) => void
	];

	const handleOptionClicked = (optionId: string | number | ReactText) => {
		setIsOptionsMenuOpen(false);

		switch (optionId) {
			case 'copy_link':
				onCopySearchLinkClicked();
				return;
		}
	};

	const copySearchLink = () => {
		copyToClipboard(window.location.href);
	};

	const onCopySearchLinkClicked = () => {
		copySearchLink();
		setIsOptionsMenuOpen(false);
		ToastService.success(t('search/views/search___de-link-is-succesvol-gekopieerd'));
	};

	return (
		<>
			<MetaTags>
				<title>{GENERATE_SITE_TITLE(t('search/views/search___zoeken-pagina-titel'))}</title>
				<meta
					name="description"
					content={t('search/views/search___zoeken-pagina-beschrijving')}
				/>
			</MetaTags>
			<PermissionGuard permissions={PermissionName.SEARCH} user={user || null}>
				<PermissionGuardPass>
					<Navbar>
						<Container mode="horizontal">
							<Toolbar className="c-toolbar--results">
								<ToolbarLeft>
									<ToolbarItem>
										<ToolbarTitle>
											<Trans i18nKey="search/views/search___zoekresultaten">
												Zoekresultaten
											</Trans>
										</ToolbarTitle>
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarRight>
									<Flex spaced="regular">
										<InteractiveTour showButton />
										<MoreOptionsDropdown
											isOpen={isOptionsMenuOpen}
											onOpen={() => setIsOptionsMenuOpen(true)}
											onClose={() => setIsOptionsMenuOpen(false)}
											menuItems={[
												{
													icon: 'link',
													id: 'copy_link',
													label: t(
														'search/views/search___kopieer-vaste-link-naar-deze-zoekopdracht'
													),
												},
											]}
											onOptionClicked={handleOptionClicked}
										/>
									</Flex>
								</ToolbarRight>
							</Toolbar>
						</Container>
					</Navbar>
					<SearchFiltersAndResults
						bookmarks
						filterState={filterState}
						setFilterState={setFilterState}
					/>
				</PermissionGuardPass>
				<PermissionGuardFail>
					<ErrorView
						message={t(
							'search/views/search___je-hebt-geen-rechten-om-de-zoek-pagina-te-bekijken'
						)}
						icon={'lock'}
						actionButtons={['home']}
					/>
				</PermissionGuardFail>
			</PermissionGuard>
		</>
	);
};

export default withUser(Search) as FunctionComponent;
