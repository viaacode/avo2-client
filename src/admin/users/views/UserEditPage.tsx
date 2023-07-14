import {
	Box,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	IconName,
	Select,
	Spacer,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { LomFieldSchema } from '@viaa/avo2-types/types/lom';
import { compact, get, map } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { SettingsService } from '../../../settings/settings.service';
import { FileUpload } from '../../../shared/components';
import LomFieldsInput from '../../../shared/components/LomFieldsInput/LomFieldsInput';
import { buildLink, CustomError, getAvatarProps, navigate } from '../../../shared/helpers';
import { PHOTO_TYPES } from '../../../shared/helpers/files';
import { UserProps } from '../../../shared/hocs/withUser';
import { useCompaniesWithUsers } from '../../../shared/hooks';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { USER_PATH } from '../user.const';

type UserEditPageProps = DefaultSecureRouteProps<{ id: string }>;

const UserEditPage: FC<UserEditPageProps & UserProps> = ({ history, match, user }) => {
	// by using user you can only edit the current logged in user 's details
	// TODO: use hook that gets user that is selected

	const { tText } = useTranslation();

	// Hooks
	const [storedProfile, setStoredProfile] = useState<Avo.User.CommonUser | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [profileErrors, setProfileErrors] = useState<
		Partial<{ [prop in keyof Avo.User.UpdateProfileValues]: string }>
	>({});

	const [companies] = useCompaniesWithUsers();
	const [firstName, setFirstName] = useState<string | undefined>();
	const [lastName, setLastName] = useState<string | undefined>();
	const [avatar, setAvatar] = useState<string | undefined>();
	const [title, setTitle] = useState<string | undefined>();
	const [bio, setBio] = useState<string | undefined>();
	const [alias, setAlias] = useState<string | undefined>();
	const [companyId, setCompanyId] = useState<string | undefined>();
	const [loms, setLoms] = useState<LomFieldSchema[]>([]);

	const onSave = async (newProfileInfo: Partial<Avo.User.Profile>) => {
		await SettingsService.updateProfileInfo(
			newProfileInfo as unknown as Avo.User.UpdateProfileValues
		);

		redirectToClientPage(buildLink(USER_PATH.USER_DETAIL, { id: match.params.id }), history);
	};

	const initializeForm = () => {
		setFirstName(user.first_name || '');
		setLastName(user.last_name || '');
		setAvatar(getAvatarProps(user.profile).image);
		setTitle(user.profile?.title || '');
		setBio(user.profile?.bio || '');
		setAlias(user.profile?.alias || '');
		setCompanyId(user.profile?.company_id || '');
		setLoms(compact(map(user.profile?.loms, 'lom')) || []);

		setStoredProfile({
			...user.profile,
			profileId: user.profile?.id || '',
			avatar: user.profile?.avatar || undefined,
			stamboek: user.profile?.stamboek || undefined,
			organisation: user.profile?.organisation || undefined,
			loms: user.profile?.loms || [],
			alias: user.profile?.alias || undefined,
			title: user.profile?.title || undefined,
			bio: user.profile?.bio || undefined,
		});
	};

	useEffect(() => {
		// TODO: await useGetUserById
		initializeForm();
	}, []);

	const navigateBack = () => {
		navigate(history, USER_PATH.USER_DETAIL, {
			id: match.params.id,
		});
	};

	const handleSave = async () => {
		if (!storedProfile) {
			return;
		}

		try {
			setIsSaving(true);

			const newProfileInfo = {
				firstName,
				lastName,
				alias,
				title,
				bio,
				userId: user.uid,
				avatar: avatar || null,
				loms: loms.map((lom) => ({
					lom_id: lom.id,
					profile_id: user.profile?.id,
				})),
				company_id: companyId || null,
			};

			try {
				onSave(newProfileInfo);
			} catch (err) {
				setIsSaving(false);

				if (JSON.stringify(err).includes('DUPLICATE_ALIAS')) {
					ToastService.danger(
						tText('settings/components/profile___deze-schermnaam-is-reeds-in-gebruik')
					);
					setProfileErrors({
						alias: tText(
							'settings/components/profile___schermnaam-is-reeds-in-gebruik'
						),
					});
					return;
				}

				throw err;
			}

			ToastService.success(tText('admin/users/views/user-edit___de-gebruiker-is-aangepast'));
		} catch (err) {
			console.error(
				new CustomError('Failed to save user', err, {
					storedProfile,
				})
			);

			ToastService.danger(
				tText('admin/users/views/user-edit___het-opslaan-van-de-gebruiker-is-mislukt')
			);
		}
		setIsSaving(false);
	};

	const renderUserDetail = () => {
		const companyLogo = get(
			(companies || []).find((company) => company.or_id === companyId),
			'logo_url',
			null
		);

		if (storedProfile) {
			return (
				<Container mode="horizontal">
					<Box backgroundColor="gray">
						<Form>
							<FormGroup label={tText('admin/users/views/user-detail___avatar')}>
								{!companyId && (
									<FileUpload
										urls={avatar ? [avatar] : []}
										onChange={(urls) => setAvatar(urls[0])}
										assetType="PROFILE_AVATAR"
										allowMulti={false}
										allowedTypes={PHOTO_TYPES}
										ownerId={match.params.id}
									/>
								)}
								{!!companyId && !!companyLogo && (
									<div
										className="c-logo-preview"
										style={{
											backgroundImage: `url(${companyLogo})`,
										}}
									/>
								)}
								{!!companyId && !companyLogo && 'geen avatar'}
							</FormGroup>

							<FormGroup label={tText('admin/users/views/user-detail___voornaam')}>
								<TextInput value={firstName} onChange={setFirstName} />
							</FormGroup>
							<FormGroup label={tText('admin/users/views/user-detail___achternaam')}>
								<TextInput value={lastName} onChange={setLastName} />
							</FormGroup>
							<FormGroup label={tText('admin/users/views/user-detail___functie')}>
								<TextInput value={title} onChange={setTitle} />
							</FormGroup>
							<FormGroup label={tText('admin/users/views/user-detail___bio')}>
								<TextArea value={bio} onChange={setBio} />
							</FormGroup>
							<FormGroup
								label={tText('admin/users/views/user-detail___gebruikersnaam')}
								error={profileErrors.alias}
							>
								<TextInput value={alias} onChange={setAlias} />
							</FormGroup>
							<LomFieldsInput loms={loms} onChange={setLoms} />
							<FormGroup label={tText('admin/users/views/user-detail___bedrijf')}>
								<Flex>
									<FlexItem>
										<Select
											options={compact(
												(companies || []).map((org) => {
													if (!org.name || !org.or_id) {
														return null;
													}

													return {
														label: org.name,
														value: org.or_id,
													};
												})
											)}
											value={companyId}
											onChange={setCompanyId}
											clearable
										/>
									</FlexItem>
									<FlexItem shrink>
										<Spacer margin="left">
											<Button
												type="danger"
												size="large"
												ariaLabel={tText(
													'admin/users/views/user-edit___verbreek-de-link-tussen-deze-gebruiker-en-dit-bedrijf'
												)}
												icon={'delete' as IconName}
												onClick={() => setCompanyId(undefined)}
											/>
										</Spacer>
									</FlexItem>
								</Flex>
							</FormGroup>
						</Form>
					</Box>
				</Container>
			);
		}
	};

	const renderUserDetailPage = () => {
		return (
			<AdminLayout
				size="large"
				pageTitle={tText('admin/users/views/user-edit___bewerk-gebruiker')}
				onClickBackButton={navigateBack}
			>
				<AdminLayoutTopBarRight>
					<ButtonToolbar>
						<Button
							label={tText('admin/user-groups/views/user-group-edit___annuleer')}
							onClick={navigateBack}
							type="tertiary"
						/>
						<Button
							disabled={isSaving}
							label={tText('admin/user-groups/views/user-group-edit___opslaan')}
							onClick={handleSave}
						/>
					</ButtonToolbar>
				</AdminLayoutTopBarRight>

				<AdminLayoutBody>{renderUserDetail()}</AdminLayoutBody>
			</AdminLayout>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						user?.full_name,
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

			{renderUserDetailPage()}
		</>
	);
};

export default UserEditPage as FC;
