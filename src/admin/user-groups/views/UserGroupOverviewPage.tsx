import { Button } from '@meemoo/react-components';
import { Flex, Icon, IconName, Spinner, Toolbar, ToolbarRight } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/use-translation/use-translation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { type UserGroupOverviewRef } from '../../shared/services/user-groups/user-groups.types';

import './UserGroupOverviewPage.scss';

const UserGroupOverview = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.UserGroupOverview,
	}))
);

const UserGroupGroupOverviewPage: FC = () => {
	const { tText, tHtml } = useTranslation();

	// Access child functions
	const permissionsRef = useRef<UserGroupOverviewRef>();

	const [hasChanges, setHasChanges] = useState<boolean>(false);

	const renderSearchButtons = (search?: string) => {
		return (
			<>
				{search && (
					<Button
						variants={['text', 'icon', 'xxs']}
						icon={<Icon name={IconName.x} aria-hidden />}
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
					icon={<Icon name={IconName.search} aria-hidden />}
					aria-label={tText('pages/admin/gebruikersbeheer/permissies/index___uitvoeren')}
					onClick={() => permissionsRef.current?.onSearch(search)}
				/>
			</>
		);
	};

	const renderActionButtons = () => {
		return (
			<>
				<Button
					variants="tertiary"
					onClick={() => permissionsRef.current?.onCancel()}
					label={tHtml('pages/admin/gebruikersbeheer/permissies/index___annuleren')}
				/>
				<Button
					variants="primary"
					onClick={() => permissionsRef.current?.onSave()}
					label={tHtml(
						'pages/admin/gebruikersbeheer/permissies/index___wijzigingen-opslaan'
					)}
				/>
			</>
		);
	};

	const renderPageContent = () => {
		return (
			<>
				<Suspense
					fallback={
						<Flex orientation="horizontal" center>
							<Spinner size="large" />
						</Flex>
					}
				>
					<UserGroupOverview
						renderSearchButtons={renderSearchButtons}
						ref={permissionsRef}
						onChangePermissions={(value: boolean) => setHasChanges(value)}
					/>
				</Suspense>
				{hasChanges && (
					<Toolbar>
						<ToolbarRight>{renderActionButtons()}</ToolbarRight>
					</Toolbar>
				)}
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText(
				'admin/user-groups/views/user-group-overview-page___groepen-en-permissies'
			)}
			size="full-width"
			className="p-admin__user-group-overview"
		>
			<AdminLayoutTopBarRight>
				{hasChanges && <>{renderActionButtons()}</>}
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Helmet>
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
				</Helmet>
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(UserGroupGroupOverviewPage);
