import { UserGroupOverview } from '@meemoo/admin-core-ui';
import { Button } from '@meemoo/react-components';
import { Icon } from '@viaa/avo2-components';
import React, { FunctionComponent, useRef } from 'react';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/use-translation/use-translation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { UserGroupOverviewRef } from '../../shared/services/user-groups/user-groups.types';

import './UserGroupOverviewPage.scss';

const UserGroupGroupOverviewPage: FunctionComponent = () => {
	const { tText } = useTranslation();

	// Access child functions
	const permissionsRef = useRef<UserGroupOverviewRef>();

	const renderSearchButtons = (search?: string) => {
		return (
			<>
				{search && (
					<Button
						variants={['text', 'icon', 'xxs']}
						icon={<Icon name="x" aria-hidden />}
						aria-label={tText(
							'pages/admin/gebruikersbeheer/permissies/index___opnieuw-instellen'
						)}
						onClick={() => {
							permissionsRef.current?.onSearch(undefined);
						}}
					/>
				)}
				<Button
					variants={['text', 'icon', 'xxs']}
					icon={<Icon name="search" aria-hidden />}
					aria-label={tText('pages/admin/gebruikersbeheer/permissies/index___uitvoeren')}
					onClick={() => permissionsRef.current?.onSearch(search)}
				/>
			</>
		);
	};

	const renderPageContent = () => {
		return <UserGroupOverview renderSearchButtons={renderSearchButtons} ref={permissionsRef} />;
	};

	return (
		<AdminLayout
			pageTitle={tText(
				'admin/user-groups/views/user-group-overview-page___groepen-en-permissies'
			)}
			size="full-width"
			className="p-admin__user-group-overview"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/user-groups/views/user-group-overview___gebruikersgroepen-beheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/user-groups/views/user-group-overview___gebruikersgroepen-beheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(UserGroupGroupOverviewPage);
