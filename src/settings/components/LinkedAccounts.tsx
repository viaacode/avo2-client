import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
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
import { Idp } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, {
	type Dispatch,
	type FC,
	type ReactNode,
	type SetStateAction,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import { commonUserAtom } from '../../authentication/authentication.store';
import {
	redirectToServerLinkAccount,
	redirectToServerUnlinkAccount,
} from '../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../constants';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { isPupil } from '../../shared/helpers/is-pupil';
import { useTranslation } from '../../shared/hooks/useTranslation';

import './LinkedAccounts.scss';

interface IdpProps {
	label: ReactNode;
	description?: ReactNode;
	iconNames: IconName[];
	hideForPupil?: boolean;
	idpParameters?: string;
}

interface DeleteModalToggle {
	open: boolean;
	setter: Dispatch<SetStateAction<boolean>>;
}

// This tab is only loaded if user is NOT a pupil (see Settings.tsx) -- no more checks here
export const LinkedAccounts: FC = () => {
	const { tText, tHtml } = useTranslation();
	const location = useLocation();
	const commonUser = useAtomValue(commonUserAtom);

	const [isDeleteVlaamseOverheidModalOpen, setIsDeleteVlaamseOverheidModalOpen] =
		useState<boolean>(false);
	const [isDeleteSmartschoolModalOpen, setIsDeleteSmartschoolModalOpe] = useState<boolean>(false);
	const [isDeleteKlascementModalOpen, setIsDeleteKlascementModalOpen] = useState<boolean>(false);
	const [isDeleteLeerIDModalOpen, setIsDeleteLeerIDModalOpen] = useState<boolean>(false);

	const isUserAPupil = isPupil(commonUser?.userGroup?.id);

	const deleteIdpModals: Record<string, DeleteModalToggle> = {
		VLAAMSEOVERHEID: {
			open: isDeleteVlaamseOverheidModalOpen,
			setter: setIsDeleteVlaamseOverheidModalOpen,
		},
		SMARTSCHOOL: { open: isDeleteSmartschoolModalOpen, setter: setIsDeleteSmartschoolModalOpe },
		LEERID: { open: isDeleteLeerIDModalOpen, setter: setIsDeleteLeerIDModalOpen },
		KLASCEMENT: { open: isDeleteKlascementModalOpen, setter: setIsDeleteKlascementModalOpen },
	};

	const idpProps: Record<string, IdpProps> = {
		VLAAMSEOVERHEID: {
			label: isUserAPupil
				? tHtml('settings/components/linked-accounts___leer-id')
				: tHtml('settings/components/linked-accounts___burgerprofiel'),
			description: isUserAPupil
				? tHtml('settings/components/linked-accounts___aanmelden-met-je-leer-id')
				: tHtml('settings/components/linked-accounts___itsme-e-id-of-een-digitale-sleutel'),
			iconNames: isUserAPupil ? [IconName.leerid] : [IconName.itsme, IconName.eid],
			idpParameters: isUserAPupil ? 'authMech=leerid' : 'authMech=itsme',
		},
		SMARTSCHOOL: {
			label: tHtml('settings/components/linked-accounts___smartschool'),
			iconNames: [IconName.smartschool],
		},
		KLASCEMENT: {
			label: tHtml('settings/components/linked-accounts___klas-cement'),
			iconNames: [IconName.klascement],
			hideForPupil: true,
		},
	};

	const renderIdpLinkControls = (idpType: Idp) => {
		let linked = !!(commonUser?.idps as any)?.[idpType];
		if (!linked && idpType === Idp.VLAAMSEOVERHEID__SUB_ID) {
			linked = !!commonUser?.idps?.VLAAMSEOVERHEID__ACCOUNT_ID;
		}
		const baseIdp = idpType.split('__')[0];
		const currentIdp = idpProps[baseIdp];
		const { open: confirmModalOpen, setter: setConfirmModalOpen } =
			deleteIdpModals[baseIdp.split('__')[0]];
		const className = `c-account-link__column--${currentIdp.iconNames.join('-')}`;

		return (
			<Spacer margin="top">
				{!(isUserAPupil && currentIdp.hideForPupil) && (
					<Grid className="c-account-link">
						<Column className={`c-account-link__column ${className}`} size="3-2">
							{currentIdp.iconNames.map((iconName: string) => (
								<Icon
									key={`c-account-link--${iconName}`}
									name={iconName as IconName}
									size="huge"
									type={
										['itsme', 'leerid'].includes(iconName)
											? 'multicolor'
											: 'custom'
									}
								/>
							))}
						</Column>
						<Column className="c-account-link__column" size="3-5">
							<span className="c-account-link__label">{currentIdp.label}</span>
							<span>{currentIdp.description}</span>
						</Column>
						<Column className="c-account-link__column" size="3-2">
							{linked ? (
								<span>
									<Icon
										className="c-account-link__icon"
										type="multicolor"
										name={IconName.circleCheck}
									/>
									{tText('settings/components/linked-accounts___gekoppeld')}
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
										label={tText(
											'settings/components/linked-accounts___verbreek-koppeling'
										)}
										title={tText(
											'settings/components/linked-accounts___verbreek-koppeling'
										)}
										onClick={() => setConfirmModalOpen(true)}
									/>
								) : (
									<Button
										type="primary"
										label={tText(
											'settings/components/linked-accounts___koppel'
										)}
										title={tText(
											'settings/components/linked-accounts___koppel'
										)}
										onClick={() =>
											redirectToServerLinkAccount(
												location,
												idpType,
												currentIdp.idpParameters
											)
										}
									/>
								)}
							</Spacer>
						</Column>
					</Grid>
				)}
				<ConfirmModal
					title={tText(
						'settings/components/linked-accounts___ben-je-zeker-dat-je-de-account-koppeling-wil-verbreken'
					)}
					confirmLabel={tText('settings/components/linked-accounts___verbreek-koppeling')}
					confirmCallback={() => {
						setConfirmModalOpen(false);
						redirectToServerUnlinkAccount(location, idpType);
					}}
					isOpen={confirmModalOpen}
					onClose={() => setConfirmModalOpen(false)}
				/>
			</Spacer>
		);
	};

	if (!commonUser) {
		return (
			<Flex center>
				<Spinner size="large" />
			</Flex>
		);
	}

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('settings/components/linked-accounts___koppelingen-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'settings/components/linked-accounts___koppelingen-pagina-beschrijving'
					)}
				/>
			</Helmet>
			<Container mode="vertical">
				<Spacer margin="bottom">
					<Grid>
						<Column size="3-8">
							<Form type="standard">
								<BlockHeading type="h3">
									{tText(
										'settings/components/linked-accounts___koppel-je-account'
									)}
								</BlockHeading>
								<FormGroup
									label={tText(
										'settings/components/account___koppel-je-account-met-andere-platformen'
									)}
								>
									{/* Previously disabled for pupils due to https://meemoo.atlassian.net/browse/AVO-2062 */}
									<div>{renderIdpLinkControls(Idp.VLAAMSEOVERHEID__SUB_ID)}</div>
									<div>{renderIdpLinkControls(Idp.SMARTSCHOOL)}</div>
									<div>{renderIdpLinkControls(Idp.KLASCEMENT)}</div>
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
