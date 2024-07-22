import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Alert,
	Button,
	Checkbox,
	Container,
	Flex,
	Form,
	FormGroup,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact } from 'lodash-es';
import React, { type FunctionComponent, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { type Dispatch } from 'redux';

import { type DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import {
	getLoginResponse,
	getLoginStateAction,
	setLoginSuccess,
} from '../../authentication/store/actions';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { EducationalOrganisationsSelect } from '../../shared/components/EducationalOrganisationsSelect/EducationalOrganisationsSelect';
import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { CustomError } from '../../shared/helpers';
import { EducationLevelId, groupLoms } from '../../shared/helpers/lom';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import store from '../../store';
import { useGetEmailPreferences } from '../hooks/useGetEmailPreferences';
import { useUpdateEmailPreferences } from '../hooks/useUpdateEmailPreferences';
import { SettingsService } from '../settings.service';

import './Profile.scss';

export interface CompleteProfileStepProps {
	redirectTo?: string;
}

const CompleteProfileStep: FunctionComponent<
	CompleteProfileStepProps & {
		getLoginState: (forceRefetch: boolean) => Dispatch;
	} & UserProps &
		DefaultSecureRouteProps
> = ({ redirectTo = APP_PATH.LOGGED_IN_HOME.route, history, user, commonUser, getLoginState }) => {
	const { tText, tHtml } = useTranslation();
	const [selectedOrganisations, setSelectedOrganisations] = useState<
		Avo.EducationOrganization.Organization[]
	>(commonUser?.educationalOrganisations || []);
	const [selectedLoms, setSelectedLoms] = useState<Avo.Lom.LomField[]>(
		compact(commonUser?.loms.map((lomLink) => lomLink.lom))
	);
	const groupedLoms = groupLoms(selectedLoms);
	const firstName = commonUser?.firstName || '';
	const lastName = commonUser?.lastName || '';
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false);
	const { data: existingEmailPreferences, isLoading: isLoadingExistingEmailPreferences } =
		useGetEmailPreferences();
	const { mutateAsync: updateEmailPreferences } = useUpdateEmailPreferences();

	const isThemesRequired = !!groupedLoms.educationLevel.find(
		(level) => level.id !== EducationLevelId.secundairOnderwijs
	);
	const isSubjectsRequired = !!groupedLoms.educationLevel.find(
		(level) => level.id === EducationLevelId.secundairOnderwijs
	);

	const areRequiredFieldsFilledIn = (profileInfo: Partial<Avo.User.UpdateProfileValues>) => {
		const errors = [];
		let filledIn = true;

		if (!groupedLoms.subject?.length && isSubjectsRequired) {
			errors.push(tText('settings/components/profile___vakken-zijn-verplicht'));
			filledIn = false;
		}
		if (!groupedLoms.theme?.length && isThemesRequired) {
			errors.push(tText('settings/components/profile___themas-zijn-verplicht'));
			filledIn = false;
		}
		if (!groupedLoms.educationLevel?.length) {
			errors.push(tText('settings/components/profile___opleidingsniveau-is-verplicht'));
			filledIn = false;
		}
		if (!profileInfo.organizations?.length) {
			errors.push(tText('settings/components/profile___educatieve-organisatie-is-verplicht'));
			filledIn = false;
		}
		if (errors.length) {
			ToastService.danger(errors);
		}
		return filledIn;
	};

	const saveNewsletterPreferences = () => {
		// Only update the newsletter preferences if the user opted in
		// We never want to unsubscribe the user from the newsletter in this screen
		// IN case this screen is shown to an existing user, we don't want to accidentally unsubscribe them
		// They can always unsubscribe in their account preferences or through the email preference center or unsubscribe all link
		if (subscribeToNewsletter) {
			updateEmailPreferences(
				{
					newEmailPreferences: {
						newsletter: true,
					},
					preferencesCenterKey: undefined,
				},
				undefined
			).catch((err) => {
				console.error(
					new CustomError('Failed to subscribe to newsletter', err, {
						preferences: {
							newsletter: true,
						},
						preferenceCenterKey: undefined,
					})
				);
				ToastService.danger(tHtml('Het inschrijven op de nieuwsbrief is mislukt.'));
			});
		}
	};

	const saveProfileChanges = async () => {
		try {
			setIsSaving(true);
			const profileId: string = getProfileId(user);
			const newProfileInfo: Partial<Avo.User.UpdateProfileValues> = {
				firstName,
				lastName,
				userId: user.uid,
				loms: (selectedLoms || []).map((lom) => ({
					profile_id: profileId,
					lom_id: lom.id,
				})),
				organizations: (selectedOrganisations || []).map((option) => ({
					profile_id: profileId,
					organization_id: option.organisationId,
					unit_id: option.unitId || null,
				})),
			};
			if (!areRequiredFieldsFilledIn(newProfileInfo)) {
				setIsSaving(false);
				return;
			}
			try {
				await SettingsService.updateProfileInfo(newProfileInfo);
			} catch (err) {
				setIsSaving(false);
				if (JSON.stringify(err).includes('DUPLICATE_ALIAS')) {
					ToastService.danger(
						tText('settings/components/profile___deze-schermnaam-is-reeds-in-gebruik')
					);
					return;
				}
				throw err;
			}

			// Refetch user permissions since education level can change user group
			getLoginState(true);

			saveNewsletterPreferences();

			// Refresh the login state, so the profile info will be up-to-date
			const loginResponse: Avo.Auth.LoginResponse = await getLoginResponse();
			store.dispatch(setLoginSuccess(loginResponse));

			// Wait for login response to be set into the store before redirecting
			setTimeout(() => {
				redirectToClientPage(redirectTo, history);
				setIsSaving(false);
			}, 0);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml(
					'settings/components/profile___het-opslaan-van-de-profiel-information-is-mislukt'
				)
			);
			setIsSaving(false);
		}
	};

	const renderEducationOrganisationsField = () => {
		return (
			<FormGroup
				label={tText('settings/components/profile___school-organisatie')}
				labelFor="educationalOrganizations"
				required
			>
				<EducationalOrganisationsSelect
					organisations={selectedOrganisations}
					onChange={setSelectedOrganisations}
				/>
				<Alert
					type="info"
					message={tText(
						'settings/components/profile___vind-je-je-onderwijsinstelling-niet-contacteer-ons-via-de-feedback-knop'
					)}
				/>
			</FormGroup>
		);
	};

	const renderCompleteProfilePage = () => {
		return (
			<Container mode="horizontal" size="medium">
				<Container mode="vertical" className="p-profile-page">
					<BlockHeading type="h1">
						{tHtml(
							'settings/components/profile___je-bent-er-bijna-vervolledig-nog-je-profiel'
						)}
					</BlockHeading>
					<Spacer margin="top-large">
						<Alert type="info">
							{tHtml(
								'settings/components/profile___we-gebruiken-deze-info-om-je-gepersonaliseerde-content-te-tonen'
							)}
						</Alert>
					</Spacer>
					<Form type="standard">
						<Spacer margin={['top-large', 'bottom-large']}>
							<LomFieldsInput
								loms={selectedLoms || []}
								onChange={(newLoms) => setSelectedLoms(newLoms)}
								educationLevelsPlaceholder={tText(
									'settings/components/profile___selecteer-een-of-meerdere-onderwijsniveaus'
								)}
								subjectsPlaceholder={tText(
									'settings/components/profile___selecteer-de-vakken-die-je-geeft'
								)}
								themesPlaceholder={tText(
									'settings/components/profile___selecteer-je-themas'
								)}
								showEducation={true}
								showThemes={true}
								showSubjects={true}
								isEducationRequired={true}
								isThemesRequired={isThemesRequired}
								isSubjectsRequired={isSubjectsRequired}
							/>
							{renderEducationOrganisationsField()}
						</Spacer>
						{/* Only show the subscribe checkbox to teachers and only if they are currently unsubscribed */}
						{user?.role?.name === 'lesgever' &&
							!isLoadingExistingEmailPreferences &&
							!existingEmailPreferences?.newsletter && (
								<Spacer margin="bottom">
									<FormGroup>
										<Checkbox
											label={tText(
												'settings/components/profile___ik-ontvang-graag-per-e-mail-tips-en-inspiratie-voor-mijn-lessen-vacatures-gratis-workshops-en-nieuws-van-partners'
											)}
											checked={subscribeToNewsletter}
											onChange={setSubscribeToNewsletter}
										/>
									</FormGroup>
								</Spacer>
							)}
					</Form>
					<Button
						label={tText('settings/components/profile___inloggen')}
						type="primary"
						disabled={isSaving}
						onClick={saveProfileChanges}
					/>
				</Container>
			</Container>
		);
	};

	return isSaving ? (
		<Spacer margin="top-extra-large">
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		</Spacer>
	) : (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('settings/components/profile___profiel-instellingen-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'settings/components/profile___profiel-instellingen-pagina-beschrijving'
					)}
				/>
			</Helmet>
			{renderCompleteProfilePage()}
		</>
	);
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: (forceRefetch: boolean) => {
			return dispatch(getLoginStateAction(forceRefetch) as any);
		},
	};
};

export default withUser(
	withRouter(connect(null, mapDispatchToProps)(CompleteProfileStep))
) as FunctionComponent<CompleteProfileStepProps>;
