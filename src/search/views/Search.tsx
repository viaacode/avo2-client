import {
	Container,
	Flex,
	IconName,
	MoreOptionsDropdown,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import { isEmpty } from 'lodash-es';
import React, {
	type FunctionComponent,
	type ReactNode,
	type ReactText,
	useEffect,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { Link, type RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
	JsonParam,
	NumberParam,
	StringParam,
	type UrlUpdateType,
	useQueryParams,
} from 'use-query-params';

import { buildGlobalSearchLink } from '../../assignment/helpers/build-search-link';
import {
	PermissionGuard,
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../authentication/components';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { InteractiveTour } from '../../shared/components';
import { getMoreOptionsLabel } from '../../shared/constants';
import { copyToClipboard, generateContentLinkString } from '../../shared/helpers';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { SearchFiltersAndResults } from '../components';
import { type FilterState } from '../search.types';

import './Search.scss';

const Search: FunctionComponent<UserProps & RouteComponentProps> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

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
		(FilterState: FilterState, updateType?: UrlUpdateType) => void,
	];

	useEffect(() => {
		if (!isEmpty(filterState.filters)) {
			trackEvents(
				{
					object: filterState.filters?.query || '',
					object_type: 'query',
					action: 'search',
					resource: filterState.filters,
				},
				user
			);
		}
	}, [filterState]);

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
		ToastService.success(tHtml('search/views/search___de-link-is-succesvol-gekopieerd'));
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
		const filters = newFilterState.filters;
		return filters && buildGlobalSearchLink(newFilterState, { className }, linkText);
	};

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(tText('search/views/search___zoeken-pagina-titel'))}
				</title>
				<meta
					name="description"
					content={tText('search/views/search___zoeken-pagina-beschrijving')}
				/>
			</Helmet>
			<PermissionGuard permissions={PermissionName.SEARCH} user={user || null}>
				<PermissionGuardPass>
					<Navbar>
						<Container mode="horizontal">
							<Toolbar className="c-toolbar--results">
								<ToolbarLeft>
									<ToolbarItem>
										<ToolbarTitle>
											{tText('search/views/search___zoekresultaten')}
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
													icon: IconName.link,
													id: 'copy_link',
													label: tText(
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
							message={tHtml(
								'search/views/search___je-hebt-geen-rechten-om-te-zoeken'
							)}
							actionButtons={['home', 'helpdesk']}
							icon={IconName.lock}
						/>
					)}
				</PermissionGuardPass>
				<PermissionGuardFail>
					<ErrorView
						message={tHtml(
							'search/views/search___je-hebt-geen-rechten-om-de-zoek-pagina-te-bekijken'
						)}
						icon={IconName.lock}
						actionButtons={['home']}
					/>
				</PermissionGuardFail>
			</PermissionGuard>
		</>
	);
};

export default compose(withRouter, withUser)(Search) as FunctionComponent;
