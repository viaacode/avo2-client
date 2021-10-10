import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps } from 'react-router';

import {
	BlockHeading,
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
import { Avo } from '@viaa/avo2-types';

import { hasIdpLinked } from '../../authentication/helpers/get-profile-info';
import {
	redirectToServerLinkAccount,
	redirectToServerUnlinkAccount,
} from '../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../constants';

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

// This tab is only loaded if user is NOT a pupil (see Settings.tsx) -- no more checks here
const LinkedAccounts: FunctionComponent<AccountProps> = ({ location, user }) => {
	const [t] = useTranslation();

	const idpToCopy: Record<any, any> = {
		VLAAMSEOVERHEID: {
			isLinked: t('Uw Vlaamse Overheid account is reeds gelinkt.'),
			buttonLabel: t('Link je Vlaamse Overheid account.'),
			buttonTitle: t('Koppel je Vlaamse Overheid account aan je Het Archief account.'),
		},
		SMARTSCHOOL: {
			isLinked: t('settings/components/account___uw-smartschool-account-is-reeds-gelinkt'),
			buttonLabel: t('settings/components/account___link-je-smartschool-account'),
			buttonTitle: t(
				'settings/components/account___koppel-je-smartschool-account-aan-je-archief-account'
			),
		},
		KLASCEMENT: {
			isLinked: t('settings/components/account___je-klascement-account-is-reeds-gelinkt'),
			buttonLabel: t('settings/components/account___link-je-klascement-account'),
			buttonTitle: t(
				'settings/components/account___koppel-je-klascement-account-aan-je-archief-account'
			),
		},
	};

	const renderIdpLinkControls = (idpType: Avo.Auth.IdpType) => {
		if (hasIdpLinked(user, idpType)) {
			return (
				<Spacer margin="medium">
					<Grid>
						<div>Test</div>
						<span>{idpToCopy[idpType].isLinked}</span>
						<Button
							type="link"
							label={t('settings/components/account___unlink')}
							title={t(
								'settings/components/account___koppel-je-smartschool-account-los-van-je-archief-account'
							)}
							onClick={() => redirectToServerUnlinkAccount(location, idpType)}
						/>
					</Grid>
				</Spacer>
			);
		}

		return (
			<Spacer margin="bottom-small">
				<Button
					className={`c-button-${idpType.toLocaleLowerCase()}`}
					icon={idpType.toLocaleLowerCase() as IconName}
					label={idpToCopy[idpType].buttonLabel}
					title={idpToCopy[idpType].buttonTitle}
					onClick={() => redirectToServerLinkAccount(location, idpType)}
				/>
			</Spacer>
		);
	};

	if (!user) {
		return (
			<Flex center>
				<Spinner size="large" />
			</Flex>
		);
	}

	return (
		<>
			<MetaTags>
				<title>{GENERATE_SITE_TITLE(t('koppelingen-pagina-titel'))}</title>
				<meta name="description" content={t('koppelingen-pagina-beschrijving')} />
			</MetaTags>
			<Container mode="vertical">
				<Spacer margin="bottom">
					<Grid>
						<Column size="3-7">
							<Form type="standard">
								<BlockHeading type="h3">{t('Koppel je account')}</BlockHeading>
								<FormGroup
									label={t(
										'settings/components/account___koppel-je-account-met-andere-platformen'
									)}
								>
									<div>{renderIdpLinkControls('VLAAMSEOVERHEID')}</div>
									<div>{renderIdpLinkControls('SMARTSCHOOL')}</div>
									<div>{renderIdpLinkControls('KLASCEMENT')}</div>
								</FormGroup>
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
export default LinkedAccounts;
