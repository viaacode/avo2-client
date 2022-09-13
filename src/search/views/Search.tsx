import {
	Container,
	Flex,
	MoreOptionsDropdown,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import queryString from 'query-string';
import React, { FunctionComponent, ReactNode, ReactText, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
	JsonParam,
	NumberParam,
	StringParam,
	UrlUpdateType,
	useQueryParams,
} from 'use-query-params';

import {
	PermissionGuard,
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../authentication/components';
import { PermissionName } from '../../authentication/helpers/permission-names';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { InteractiveTour } from '../../shared/components';
import { buildLink, copyToClipboard, generateContentLinkString } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import { SearchFiltersAndResults } from '../components';
import { FilterState } from '../search.types';

import './Search.scss';
import { getMoreOptionsLabel } from '../../shared/constants';

const Search: FunctionComponent<UserProps & RouteComponentProps> = ({ user }) => {
	const [t] = useTranslation();

	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const queryParamConfig = {
		filters: JsonParam,
		orderProperty: StringParam,
		orderDirection: StringParam,
		tab: StringParam,
		page: NumberParam,
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

	const renderDetailLink = (
		linkText: string | ReactNode,
		id: string,
		type: Avo.Core.ContentType
	) => {
		return <Link to={generateContentLinkString(type, id)}>{linkText}</Link>;
	};

	const renderSearchLink = (
		linkText: string | ReactNode,
		newFilterState: FilterState,
		className?: string
	) => {
		return (
			<Link
				to={buildLink(APP_PATH.SEARCH.route, {}, queryString.stringify(newFilterState))}
				className={className}
			>
				{linkText}
			</Link>
		);
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
											{t('search/views/search___zoekresultaten')}
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
											label={getMoreOptionsLabel()}
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
					{PermissionService.hasPerm(user, PermissionName.SEARCH) ? (
						<SearchFiltersAndResults
							bookmarks
							filterState={filterState}
							setFilterState={setFilterState}
							renderDetailLink={renderDetailLink}
							renderSearchLink={renderSearchLink}
						/>
					) : (
						<ErrorView
							message={t('search/views/search___je-hebt-geen-rechten-om-te-zoeken')}
							actionButtons={['home', 'helpdesk']}
							icon="lock"
						/>
					)}
				</PermissionGuardPass>
				<PermissionGuardFail>
					<ErrorView
						message={t(
							'search/views/search___je-hebt-geen-rechten-om-de-zoek-pagina-te-bekijken'
						)}
						icon="lock"
						actionButtons={['home']}
					/>
				</PermissionGuardFail>
			</PermissionGuard>
		</>
	);
};

export default compose(withRouter, withUser)(Search) as FunctionComponent;
