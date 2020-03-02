import { useMutation } from '@apollo/react-hooks';
import { compact, get, startCase, uniq, without } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Badge,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	IconName,
	SelectOption,
	Spacer,
	Spinner,
	TagInfo,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { CustomError, navigate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ApolloCacheManager, dataService } from '../../../shared/services/data-service';
import { ValueOf } from '../../../shared/types';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { ContentPickerType, PickerItem } from '../../shared/types';

import { ApolloQueryResult } from 'apollo-boost';
import { getAllUserGroups } from '../../../shared/services/user-groups-service';
import { GET_PERMISSIONS_FROM_CONTENT_PAGE_BY_PATH } from '../../content/content.gql';
import { MenuEditForm } from '../components';
import { INITIAL_MENU_FORM, MENU_PATH, PAGE_TYPES_LANG } from '../menu.const';
import { INSERT_MENU_ITEM, UPDATE_MENU_ITEM_BY_ID } from '../menu.gql';
import { fetchMenuItemById, fetchMenuItems } from '../menu.service';
import {
	MenuEditFormErrorState,
	MenuEditFormState,
	MenuEditPageType,
	MenuEditParams,
} from '../menu.types';

export enum SpecialPermissionGroups {
	loggedOutUsers = -1,
	loggedInUsers = -2,
}

export interface MenuSchema {
	id: number;
	label: string;
	icon_name: string;
	description: string | null;
	user_group_ids: number[];
	content_type: ContentPickerType | null;
	content_path: string | null;
	link_target: '_blank' | '_self' | null;
	position: number;
	placement: string;
	created_at: string;
	updated_at: string;
}

interface MenuEditProps extends DefaultSecureRouteProps<MenuEditParams> {}

const MenuEdit: FunctionComponent<MenuEditProps> = ({ history, match }) => {
	const [t] = useTranslation();

	const { menu: menuParentId, id: menuItemId } = match.params;
	const menuName = startCase(menuParentId);

	// Hooks
	const [menuForm, setMenuForm] = useState<MenuEditFormState>(INITIAL_MENU_FORM(menuParentId));
	const [initialMenuItem, setInitialMenuItem] = useState<Avo.Menu.Menu | null>(null);
	const [menuItems, setMenuItems] = useState<Avo.Menu.Menu[]>([]);
	const [formErrors, setFormErrors] = useState<MenuEditFormErrorState>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [permissionWarning, setPermissionWarning] = useState<ReactNode | null>(null);
	const [allUserGroups, setAllUserGroups] = useState<TagInfo[]>([]);

	const [triggerMenuItemInsert] = useMutation(INSERT_MENU_ITEM);
	const [triggerMenuItemUpdate] = useMutation(UPDATE_MENU_ITEM_BY_ID);

	// Fetch menu items depending on menu parent param
	// This is necessary for populating the menu parent options for our form
	useEffect(() => {
		fetchMenuItems(menuParentId).then(menuItemsByPosition => {
			if (menuItemsByPosition && menuItemsByPosition.length) {
				setMenuItems(menuItemsByPosition);
			} else {
				// Go back to overview if no menu items are present
				ToastService.danger(
					t(
						'admin/menu/views/menu-edit___er-werden-geen-navigatie-items-gevonden-voor-menu-name',
						{
							menuName,
						}
					),
					false
				);
				history.push(MENU_PATH.MENU);
			}
		});
	}, [history, menuName, menuParentId, t]);

	// Fetch menu item by id
	useEffect(() => {
		if (menuItemId) {
			setIsLoading(true);
			// Fetch menu item by id so we can populate our form for editing
			fetchMenuItemById(Number(menuItemId))
				.then((menuItem: Avo.Menu.Menu | null) => {
					if (menuItem) {
						// Remove unnecessary props for saving
						delete (menuItem as any).__typename;

						setInitialMenuItem(menuItem);
						setMenuForm({
							description: menuItem.description || '',
							icon: menuItem.icon_name as IconName,
							label: menuItem.label,
							content_type: menuItem.content_type || 'COLLECTION',
							content_path: String(menuItem.content_path || ''),
							link_target: menuItem.link_target || '_self',
							user_group_ids: menuItem.user_group_ids || [],
							placement: menuItem.placement,
						});
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [menuItemId, menuParentId]);

	// Get labels of the userGroups, so we can show a readable error message
	useEffect(() => {
		getAllUserGroups()
			.then(userGroups => {
				setAllUserGroups(userGroups);
			})
			.catch((err: any) => {
				console.error('Failed to get user groups', err);
				ToastService.danger(
					t(
						'admin/shared/components/user-group-select/user-group-select___het-controleren-van-je-account-rechten-is-mislukt'
					),
					false
				);
			});
	}, [setAllUserGroups, t]);

	const checkMenuItemContentPagePermissionsMismatch = useCallback(
		(response: ApolloQueryResult<any>) => {
			let contentUserGroupIds: number[] = get(
				response,
				'data.app_content[0].user_group_ids',
				[]
			);
			const navItemUserGroupIds: number[] = menuForm.user_group_ids;
			const allUserGroupIds: number[] = allUserGroups.map(ug => ug.value as number);

			// Add all user groups to content page user groups if content page is accessible by special user group: logged in users
			if (contentUserGroupIds.includes(SpecialPermissionGroups.loggedInUsers)) {
				contentUserGroupIds = uniq([
					...contentUserGroupIds,
					...without(allUserGroupIds, SpecialPermissionGroups.loggedOutUsers),
				]);
			}

			const faultyUserGroupIds = without(navItemUserGroupIds, ...contentUserGroupIds);
			if (faultyUserGroupIds.length) {
				const faultyUserGroups = compact(
					faultyUserGroupIds.map(faultyUserGroupId => {
						const faultyUserGroup = allUserGroups.find(
							userGroup => userGroup.value === faultyUserGroupId
						);
						return get(faultyUserGroup, 'label', null);
					})
				);
				setPermissionWarning(
					<div>
						<Spacer margin="bottom-small">
							<Trans i18nKey="admin/menu/views/menu-edit___het-navigatie-item-zal-zichtbaar-zijn-voor-gebruikers-die-geen-toegang-hebben-tot-de-geselecteerde-pagina">
								Het navigatie item zal zichtbaar zijn voor gebruikers die geen
								toegang hebben tot de geselecteerde pagina.
							</Trans>
						</Spacer>
						<Spacer margin="bottom-small">
							<Trans i18nKey="admin/menu/views/menu-edit___de-geselecteerde-pagina-is-niet-toegankelijk-voor">
								De geselecteerde pagina is niet toegankelijk voor:
							</Trans>
							<ButtonToolbar>
								{faultyUserGroups.map(group => (
									<Badge text={group} />
								))}
							</ButtonToolbar>
						</Spacer>
					</div>
				);
			} else {
				setPermissionWarning(null);
			}
		},
		[setPermissionWarning, menuForm.user_group_ids, allUserGroups]
	);

	// Check if the navigation item is visible for users that do not have access to the selected content page
	useEffect(() => {
		if (menuForm.content_type === 'CONTENT_PAGE' && menuForm.content_path) {
			// Check if permissions are more strict than the permissions on the content_page
			dataService
				.query({
					query: GET_PERMISSIONS_FROM_CONTENT_PAGE_BY_PATH,
					variables: {
						path: menuForm.content_path,
					},
				})
				.then(response => {
					checkMenuItemContentPagePermissionsMismatch(response);
				})
				.catch(err => {
					console.error(
						new CustomError('Failed to get permissions from page', err, {
							query: 'GET_PERMISSIONS_FROM_CONTENT_PAGE_BY_PATH',
							variables: {
								path: menuForm.content_path,
							},
						})
					);
					ToastService.danger(
						t(
							'admin/menu/views/menu-edit___het-controleren-of-de-permissies-van-de-pagina-overeenkomen-met-de-zichtbaarheid-van-dit-navigatie-item-is-mislukt'
						),
						false
					);
				});
		}
	}, [
		menuForm.content_type,
		menuForm.content_path,
		menuForm.user_group_ids,
		checkMenuItemContentPagePermissionsMismatch,
		t,
	]);

	// Computed
	const pageType: MenuEditPageType = menuItemId ? 'edit' : 'create';
	const pageTitle = menuParentId
		? `${menuName}: item ${PAGE_TYPES_LANG[pageType]}`
		: t('admin/menu/views/menu-edit___navigatie-toevoegen');
	const menuParentOptions = menuItems.reduce(
		(acc: SelectOption<string>[], { placement }: Avo.Menu.Menu) => {
			// Don't add duplicates to the options
			if (acc.find(opt => opt.value === placement)) {
				return acc;
			}

			return [...acc, { label: startCase(placement), value: placement }];
		},
		[]
	);

	// Methods
	const handleChange = (
		key: keyof MenuEditFormState | 'content',
		value: ValueOf<MenuEditFormState> | PickerItem | null
	): void => {
		if (key === 'content') {
			setMenuForm({
				...menuForm,
				content_type: (value as PickerItem).type,
				content_path: (value as PickerItem).value,
			});
		} else {
			setMenuForm({
				...menuForm,
				[key]: value,
			});
		}
	};

	const handleSave = (): void => {
		setIsSaving(true);

		// Validate form
		const isFormValid = handleValidation();

		if (!isFormValid) {
			setIsSaving(false);

			return;
		}

		const menuItem: Partial<MenuSchema> = {
			icon_name: menuForm.icon,
			label: menuForm.label,
			content_path: menuForm.content_path,
			content_type: menuForm.content_type,
			link_target: menuForm.link_target,
			user_group_ids: menuForm.user_group_ids,
			placement: menuForm.placement,
		};

		if (pageType === 'create') {
			triggerMenuItemInsert({
				variables: {
					menuItem: {
						...menuItem,
						// Get description from existing items or use form description field
						description: get(menuItems, '[0].description', menuForm.description),
						position: menuItems.length,
					},
				},
				update: ApolloCacheManager.clearNavElementsCache,
			})
				.then(() =>
					handleResponse(
						t('admin/menu/views/menu-edit___het-navigatie-item-is-succesvol-aangemaakt')
					)
				)
				.catch(err =>
					handleResponse(
						t(
							'admin/menu/views/menu-edit___het-aanmaken-van-het-navigatie-item-is-mislukt'
						),
						err || null
					)
				);
		} else {
			triggerMenuItemUpdate({
				variables: {
					id: menuItemId,
					menuItem: {
						...initialMenuItem,
						...menuItem,
						updated_at: new Date().toISOString(),
					},
				},
				update: ApolloCacheManager.clearNavElementsCache,
			})
				.then(() =>
					handleResponse(
						t('admin/menu/views/menu-edit___het-navigatie-item-is-succesvol-geupdatet')
					)
				)
				.catch(err =>
					handleResponse(
						t(
							'admin/menu/views/menu-edit___het-updaten-van-het-navigatie-item-is-mislukt'
						),
						err || null
					)
				);
		}
	};

	const handleResponse = (message: string, err?: any): void => {
		setIsSaving(false);

		const hasError = err || err === null;
		ToastService[hasError ? 'danger' : 'success'](message, false);

		if (hasError) {
			console.error(err);
			return;
		}

		navigate(history, MENU_PATH.MENU_DETAIL, { menu: menuForm.placement });
	};

	const handleValidation = (): boolean => {
		const errors: MenuEditFormErrorState = {};

		if (!menuParentId && !menuForm.placement) {
			errors.placement = t('admin/menu/views/menu-edit___navigatie-naam-is-verplicht');
		}

		if (!menuForm.label) {
			errors.label = t('admin/menu/views/menu-edit___label-is-verplicht');
		}

		if (!menuForm.content_path) {
			errors.content_path = t('admin/menu/views/menu-edit___link-is-verplicht');
		}

		setFormErrors(errors);

		return Object.keys(errors).length === 0;
	};

	const navigateBack = (): void => {
		if (menuParentId) {
			navigate(history, MENU_PATH.MENU_DETAIL, { menu: menuParentId });
		} else {
			navigate(history, MENU_PATH.MENU);
		}
	};

	// Render
	return isLoading ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<AdminLayout showBackButton pageTitle={pageTitle}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<MenuEditForm
							formErrors={formErrors}
							formState={menuForm}
							menuParentId={menuParentId}
							menuParentOptions={menuParentOptions}
							onChange={handleChange}
							permissionWarning={permissionWarning}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label={t('admin/menu/views/menu-edit___annuleer')}
					onClick={navigateBack}
					type="tertiary"
				/>
				<Button
					disabled={isSaving}
					label={t('admin/menu/views/menu-edit___opslaan')}
					onClick={handleSave}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default MenuEdit;
