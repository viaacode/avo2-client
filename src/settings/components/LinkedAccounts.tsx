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
	Icon,
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

import './LinkedAccounts.scss';

export interface AccountProps extends RouteComponentProps {
	user: Avo.User.User;
}

interface IdpProps {
	label: string;
	description?: string;
	iconNames: IconName[];
}

const idpProps: Record<string, IdpProps> = {
	VLAAMSEOVERHEID: {
		label: 'Burgerprofiel',
		description: 'itsme, eID of een digitale sleutel',
		iconNames: ['itsme' as IconName, 'eid' as IconName], // TODO: Remove `as IconName`.
	},
	SMARTSCHOOL: {
		label: 'Smartschool',
		iconNames: ['smartschool'],
	},
	KLASCEMENT: {
		label: 'KlasCement',
		iconNames: ['klascement'],
	},
};

// This tab is only loaded if user is NOT a pupil (see Settings.tsx) -- no more checks here
const LinkedAccounts: FunctionComponent<AccountProps> = ({ location, user }) => {
	const [t] = useTranslation();

	const renderIdpLinkControls = (idpType: Avo.Auth.IdpType) => {
		const linked = hasIdpLinked(user, idpType);
		const currentIdp = idpProps[idpType];

		return (
			<Spacer margin="top">
				<Grid className="c-account-link">
					<Column
						className={`c-account-link__column c-account-link__column--${currentIdp.label.toLowerCase()}`}
						size="3-2"
					>
						{currentIdp.iconNames.map((iconName: string) => (
							<Icon name={iconName as IconName} size="huge"></Icon>
						))}
					</Column>
					<Column className="c-account-link__column" size="3-5">
						<span className="c-account-link__label">{currentIdp.label}</span>
						<span>{currentIdp.description}</span>
					</Column>
					<Column className="c-account-link__column" size="3-2">
						{linked ? (
							<span>
								<Icon className="c-account-link__icon" name="check-circle"></Icon>
								Gekoppeld
							</span>
						) : (
							<></>
						)}
					</Column>
					<Column className="c-account-link__column" size="3-3">
						<Spacer margin="right">
							{linked ? (
								<Button
									type="secondary"
									label={t('Verbreek koppeling')}
									title={t('Verbreek koppeling')}
									onClick={() => redirectToServerUnlinkAccount(location, idpType)}
								/>
							) : (
								<Button
									type="primary"
									label={t('Koppel')}
									title={t('Koppel')}
									onClick={() => redirectToServerLinkAccount(location, idpType)}
								/>
							)}
						</Spacer>
					</Column>
				</Grid>
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
						<Column size="3-8">
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
						<Column size="3-4">
							<></>
						</Column>
					</Grid>
				</Spacer>
			</Container>
		</>
	);
};
export default LinkedAccounts;
