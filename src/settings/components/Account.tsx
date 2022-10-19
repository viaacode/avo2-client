import {
	Alert,
	BlockHeading,
	Button,
	Column,
	Container,
	Flex,
	Form,
	FormGroup,
	Grid,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps } from 'react-router';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { redirectToExternalPage } from '../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import Html from '../../shared/components/Html/Html';
import { formatDate, getEnv } from '../../shared/helpers';

// const ssumAccountEditPage = getEnv('SSUM_ACCOUNT_EDIT_URL') as string;
const ssumPasswordEditPage = getEnv('SSUM_PASSWORD_EDIT_URL') as string;

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

const Account: FunctionComponent<AccountProps> = ({ user }) => {
	const [t] = useTranslation();

	const isPupil = get(user, 'profile.userGroupIds[0]') === SpecialUserGroup.Pupil;

	const hasTempAccess = get(user, 'temp_access.current.status') === 1;

	if (!user) {
		return (
			<Flex center>
				<Spinner size="large" />
			</Flex>
		);
	}

	if (
		isPupil &&
		!get(user, 'idpmaps', []).find((idpMap: Avo.Auth.IdpType) => idpMap === 'HETARCHIEF')
	) {
		return (
			<ErrorView
				message={t(
					'settings/components/account___je-hebt-geen-toegang-tot-de-account-pagina'
				)}
				icon="lock"
			/>
		);
	}
	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t('settings/components/account___account-instellingen-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={t('settings/components/account___account-pagina-beschrijving')}
				/>
			</MetaTags>
			<Container mode="vertical">
				<Spacer margin="bottom">
					<Grid>
						<Column size="3-7">
							<Form type="standard">
								<Form type="standard">
									<BlockHeading type="h3">
										{t('settings/components/account___account')}
									</BlockHeading>
									<FormGroup label={t('settings/components/account___email')}>
										<span>{get(user, 'mail')}</span>
									</FormGroup>
									{/* TODO re-enable when summ allows you to change your email address */}
									{/*<Spacer margin="bottom">*/}
									{/*	<Button*/}
									{/*		type="secondary"*/}
									{/*		onClick={() =>*/}
									{/*			redirectToExternalPage(ssumAccountEditPage, null)*/}
									{/*		}*/}
									{/*		label={t(*/}
									{/*			'settings/components/account___wijzig-accountgegevens'*/}
									{/*		)}*/}
									{/*	/>*/}
									{/*</Spacer>*/}
									<BlockHeading type="h3">
										{t('settings/components/account___wachtwoord')}
									</BlockHeading>
									<Spacer margin="top">
										<Button
											type="secondary"
											onClick={() =>
												redirectToExternalPage(
													`${ssumPasswordEditPage}&email=${get(
														user,
														'mail'
													)}`,
													null
												)
											}
											label={t(
												'settings/components/account___wijzig-wachtwoord'
											)}
										/>
									</Spacer>
									{!isPupil && (
										<Spacer margin="top-large">
											<Alert type="info">
												<Html
													className="c-content"
													content={t(
														'settings/components/account___beheerd-in-een-centraal-identiteitsmanagementsysteem'
													)}
													type="span"
												/>
											</Alert>
										</Spacer>
									)}
									{hasTempAccess && (
										<Spacer margin="top-large">
											<BlockHeading type="h3">
												{t(
													'settings/components/account___tijdelijke-toegang'
												)}
											</BlockHeading>
											<span>
												{`${t(
													'settings/components/account___dit-is-een-tijdelijk-account-de-toegang-van-je-account-verloopt-op'
												)} ${formatDate(get(user, 'temp_access.until'))}`}
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
