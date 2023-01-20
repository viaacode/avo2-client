import { UserEdit } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import React, { FC, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { SettingsService } from '../../../settings/settings.service';
import { buildLink } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { USER_PATH } from '../user.const';

type UserEditPageProps = DefaultSecureRouteProps<{ id: string }>;

const UserEditPage: FC<UserEditPageProps> = ({ history, match }) => {
	const { tText } = useTranslation();
	const [user, setUser] = useState<{ fullName?: string } | undefined>();

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						user?.fullName,
						tText('admin/users/views/user-detail___item-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/users/views/user-detail___gebruikersbeheer-detail-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			<UserEdit
				id={match.params.id}
				onSave={async (newProfileInfo: Partial<Avo.User.Profile>) => {
					await SettingsService.updateProfileInfo({
						...newProfileInfo,
						subjects: (newProfileInfo.subjects || []).map((option) => ({
							profile_id: match.params.id,
							key: option,
						})),
					} as any);

					redirectToClientPage(
						buildLink(USER_PATH.USER_DETAIL, { id: match.params.id }),
						history
					);
				}}
				onLoaded={setUser}
			/>
		</>
	);
};

export default withAdminCoreConfig(UserEditPage as FC);
