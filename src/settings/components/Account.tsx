import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Button,
	Column,
	Container,
	Flex,
	Form,
	FormGroup,
	Grid,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps } from 'react-router';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { redirectToExternalPage } from '../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { formatDate, getEnv } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';

// const ssumAccountEditPage = getEnv('SSUM_ACCOUNT_EDIT_URL') as string;
const ssumPasswordEditPage = getEnv('SSUM_PASSWORD_EDIT_URL') as string;

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

const Account: FC<AccountProps> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

	const isPupil =
		user?.profile?.userGroupIds[0] &&
		[SpecialUserGroup.PupilSecondary, SpecialUserGroup.PupilElementary]
			.map(String)
			.includes(String(user.profile.userGroupIds[0]));

	const hasTempAccess = user?.temp_access?.current?.status === 1;

	if (!user) {
		return (
			<Flex center>
				<Spinner size="large" />
			</Flex>
		);
	}

	if (
		isPupil &&
		!(user?.idpmaps ?? []).find((idpMap: Avo.Auth.IdpType) => idpMap === 'HETARCHIEF')
	) {
		return (
			<ErrorView
				message={tHtml(
					'settings/components/account___je-hebt-geen-toegang-tot-de-account-pagina'
				)}
				icon={IconName.lock}
			/>
		);
	}
	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('settings/components/account___account-instellingen-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText('settings/components/account___account-pagina-beschrijving')}
				/>
			</Helmet>
			<Container mode="vertical">
				<Spacer margin="bottom">
					<Grid>
						<Column size="3-7">
							<Form type="standard">
								<Form type="standard">
									<BlockHeading type="h3">
										{tText('settings/components/account___account')}
									</BlockHeading>
									<FormGroup label={tText('settings/components/account___email')}>
										<span>{user?.mail || '-'}</span>
									</FormGroup>
									{/* TODO re-enable when summ allows you to change your email address */}
									{/*<Spacer margin="bottom">*/}
									{/*	<Button*/}
									{/*		type="secondary"*/}
									{/*		onClick={() =>*/}
									{/*			redirectToExternalPage(ssumAccountEditPage, null)*/}
									{/*		}*/}
									{/*		label={tText(*/}
									{/*			'settings/components/account___wijzig-accountgegevens'*/}
									{/*		)}*/}
									{/*	/>*/}
									{/*</Spacer>*/}
									<BlockHeading type="h3">
										{tText('settings/components/account___wachtwoord')}
									</BlockHeading>
									{!!user?.mail && (
										<Spacer margin="top">
											<Button
												type="secondary"
												onClick={() =>
													redirectToExternalPage(
														`${ssumPasswordEditPage}&email=${user?.mail}`,
														null
													)
												}
												label={tText(
													'settings/components/account___wijzig-wachtwoord'
												)}
											/>
										</Spacer>
									)}
									{!isPupil && (
										<Spacer margin="top-large">
											<Alert type="info">
												<span className="c-content">
													{tHtml(
														'settings/components/account___beheerd-in-een-centraal-identiteitsmanagementsysteem'
													)}
												</span>
											</Alert>
										</Spacer>
									)}
									{hasTempAccess && (
										<Spacer margin="top-large">
											<BlockHeading type="h3">
												{tText(
													'settings/components/account___tijdelijke-toegang'
												)}
											</BlockHeading>
											<span>
												{`${tText(
													'settings/components/account___dit-is-een-tijdelijk-account-de-toegang-van-je-account-verloopt-op'
												)} ${formatDate(user?.temp_access?.until)}`}
												.
											</span>
										</Spacer>
									)}
								</Form>
							</Form>
						</Column>
						<Column size="3-5">
							<></>
						</Column>
					</Grid>
				</Spacer>
			</Container>
		</>
	);
};
export default Account;
