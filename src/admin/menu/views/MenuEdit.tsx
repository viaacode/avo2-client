import { ApolloQueryResult } from 'apollo-boost';
import { compact, get, isNil, startCase, uniq, uniqBy, without } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Badge,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	IconName,
	Spacer,
	Spinner,
	TagInfo,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { SpecialPermissionGroups } from '../../../authentication/authentication.types';
import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { CustomError, navigate } from '../../../shared/helpers';
import { dataService, ToastService } from '../../../shared/services';
import { fetchAllUserGroups } from '../../../shared/services/user-groups-service';
import { ValueOf } from '../../../shared/types';
import { GET_PERMISSIONS_FROM_CONTENT_PAGE_BY_PATH } from '../../content/content.gql';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import { MenuEditForm } from '../components';
import { GET_PAGE_TYPES_LANG, INITIAL_MENU_FORM, MENU_PATH } from '../menu.const';
import { MenuService } from '../menu.service';
import { MenuEditFormErrorState, MenuEditPageType, MenuEditParams } from '../menu.types';

interface MenuEditProps extends DefaultSecureRouteProps<MenuEditParams> {}

const MenuEdit: FunctionComponent<MenuEditProps> = ({ history, match }) => {
	const [t] = useTranslation();

	const { menu: menuParentId, id: menuItemId } = match.params;
	const menuName = startCase(menuParentId);

	// Hooks
	const [menuForm, setMenuForm] = useState<Avo.Menu.Menu>(
		INITIAL_MENU_FORM(menuParentId ? String(menuParentId) : '0') as Avo.Menu.Menu
	);
	const [initialMenuItem, setInitialMenuItem] = useState<Avo.Menu.Menu | null>(null);
	const [menuItems, setMenuItems] = useState<Avo.Menu.Menu[]>([]);
	const [formErrors, setFormErrors] = useState<MenuEditFormErrorState>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [permissionWarning, setPermissionWarning] = useState<ReactNode | null>(null);
	const [allUserGroups, setAllUserGroups] = useState<TagInfo[]>([]);

	// Fetch menu items depending on menu parent param
	// This is necessary for populating the menu parent options for our form
	useEffect(() => {
		MenuService.fetchMenuItems(menuParentId).then(menuItemsByPosition => {
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
			MenuService.fetchMenuItemById(Number(menuItemId))
				.then((menuItem: Avo.Menu.Menu | null) => {
					if (menuItem) {
						// Remove unnecessary props for saving
						delete (menuItem as any).__typename;

						setInitialMenuItem(menuItem);
						setMenuForm({
							description: menuItem.description || '',
							icon_name: menuItem.icon_name as IconName,
							label: menuItem.label,
							content_type: menuItem.content_type || 'COLLECTION',
							content_path: String(menuItem.content_path || ''),
							link_target: menuItem.link_target || '_self',
							user_group_ids: menuItem.user_group_ids || [],
							placement: menuItem.placement || null,
							tooltip: menuItem.tooltip,
						} as Avo.Menu.Menu);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [menuItemId, menuParentId]);

	// Get labels of the userGroups, so we can show a readable error message
	useEffect(() => {
		fetchAllUserGroups()
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
			const navItemUserGroupIds: number[] = menuForm.user_group_ids || [];
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
		? `${menuName}: item ${GET_PAGE_TYPES_LANG()[pageType]}`
		: t('admin/menu/views/menu-edit___navigatie-toevoegen');
	const menuParentOptions = uniqBy(
		compact(
			menuItems.map(menuItem => {
				if (!menuItem.placement) {
					return null;
				}
				return {
					label: startCase(menuItem.placement || ''),
					value: menuItem.placement,
				};
			})
		),
		'value'
	);

	// Methods
	const handleChange = (
		key: keyof Avo.Menu.Menu | 'content',
		value: ValueOf<Avo.Menu.Menu> | PickerItem | null
	): void => {
		if (key === 'content') {
			setMenuForm({
				...menuForm,
				content_type: get(value, 'type'),
				content_path: get(value, 'value'),
				link_target: get(value, 'target', '_self'),
			});
		} else {
			setMenuForm({
				...menuForm,
				[key]: value,
			});
		}
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);

			// Validate form
			const isFormValid = handleValidation();

			if (!isFormValid) {
				setIsSaving(false);

				return;
			}

			const menuItem: Partial<Avo.Menu.Menu> = {
				icon_name: menuForm.icon_name,
				label: menuForm.label,
				content_path: menuForm.content_path,
				content_type: menuForm.content_type,
				link_target: menuForm.link_target,
				user_group_ids: menuForm.user_group_ids,
				placement: menuForm.placement,
				tooltip: menuForm.tooltip,
			};

			if (pageType === 'create') {
				await MenuService.insertMenuItem({
					...menuItem,
					// Get description from existing items or use form description field
					description: get(menuItems, '[0].description', menuForm.description),
					position: menuItems.length,
				} as any); // TODO: Replace any by Avo.Menu.Menu at typings 2.16.
				ToastService.success(
					t('admin/menu/views/menu-edit___het-navigatie-item-is-succesvol-aangemaakt'),
					false
				);
			} else {
				if (isNil(menuItemId)) {
					throw new CustomError('cannot update menu item because id is undefined', null, {
						menuItemId,
					});
				}
				await MenuService.updateMenuItems([
					{
						...initialMenuItem,
						...menuItem,
						id: +menuItemId,
						updated_at: new Date().toISOString(),
					} as Avo.Menu.Menu,
				]);
				ToastService.success(
					t('admin/menu/views/menu-edit___het-navigatie-item-is-succesvol-geupdatet'),
					false
				);
			}
		} catch (err) {
			console.error(
				new CustomError('Failed to save menu item', err, {
					menuForm,
				})
			);
			ToastService.danger(
				t('admin/menu/views/menu-edit___het-updaten-van-het-navigatie-item-is-mislukt'),
				false
			);
		}
		setIsSaving(false);
	};

	const handleValidation = (): boolean => {
		const errors: MenuEditFormErrorState = {};

		if (!menuParentId && !menuForm.placement) {
			errors.placement = t('admin/menu/views/menu-edit___navigatie-naam-is-verplicht');
		}

		if (!menuForm.content_path) {
			errors.content_path = t('admin/menu/views/menu-edit___link-is-verplicht');
		}

		setFormErrors(errors);

		return Object.keys(errors).length === 0;
	};

	const navigateBack = (): void => {
		if (menuParentId) {
			navigate(history, MENU_PATH.MENU_DETAIL, {
				menu: menuParentId,
			});
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
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
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
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
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
		</AdminLayout>
	);
};

export default MenuEdit;
