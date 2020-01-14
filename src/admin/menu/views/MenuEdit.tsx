import { useMutation } from '@apollo/react-hooks';
import { get, startCase } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Container, Flex, IconName, SelectOption, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { navigate } from '../../../shared/helpers';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { MenuEditForm } from '../components';
import { INITIAL_MENU_FORM, MENU_PATH, PAGE_TYPES_LANG } from '../menu.const';
import { INSERT_MENU_ITEM, UPDATE_MENU_ITEM_BY_ID } from '../menu.gql';
import { fetchMenuItemById, fetchMenuItems } from '../menu.services';
import {
	MenuEditFormErrorState,
	MenuEditFormState,
	MenuEditPageType,
	MenuEditParams,
} from '../menu.types';

interface MenuEditProps extends DefaultSecureRouteProps<MenuEditParams> {}

const MenuEdit: FunctionComponent<MenuEditProps> = ({ history, match }) => {
	const [t] = useTranslation();

	const { menu: menuParentId, id: menuItemId } = match.params;
	const menuName = startCase(menuParentId);

	// Hooks
	const [menuForm, setMenuForm] = useState<MenuEditFormState>(INITIAL_MENU_FORM(menuParentId));
	const [initialMenuItem, setInitialMenuItem] = useState<Avo.Menu.Menu | null>(null);
	const [menuItems, setMenuItems] = useState<Avo.Menu.Menu[]>([]);
	const [formErrors, setFormErrors] = useState<Partial<MenuEditFormErrorState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

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
				toastService.danger(
					t(`Er werden geen navigatie items gevonden voor {menuName}`, { menuName })
				);
				history.push(MENU_PATH.MENU);
			}
		});
	}, [history, menuName, menuParentId]);

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
							external_link: menuItem.external_link || '', // TODO add content block link
							link_target: menuItem.link_target || '_self',
							group_access: (menuItem.group_access || []) as number[],
							placement: menuItem.placement,
						});
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [menuItemId, menuParentId]);

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
	const handleChange = (key: keyof MenuEditFormState, value: any): void => {
		setMenuForm({
			...menuForm,
			[key]: value,
		});
	};

	const handleSave = (): void => {
		setIsSaving(true);

		// Validate form
		const isFormValid = handleValidation();

		if (!isFormValid) {
			setIsSaving(false);

			return;
		}

		const menuItem: Partial<Avo.Menu.Menu> = {
			icon_name: menuForm.icon,
			label: menuForm.label,
			external_link: menuForm.external_link,
			link_target: menuForm.link_target,
			group_access: menuForm.group_access,
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
						t('admin/menu/views/menu-edit___het-aanmaken-van-het-navigatie-item-is-mislukt'),
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
						t('admin/menu/views/menu-edit___het-updaten-van-het-navigatie-item-is-mislukt'),
						err || null
					)
				);
		}
	};

	const handleResponse = (message: string, err?: any): void => {
		setIsSaving(false);

		const hasError = err || err === null;
		toastService[hasError ? 'danger' : 'success'](message, false);

		if (hasError) {
			console.error(err);
			return;
		}

		navigate(history, MENU_PATH.MENU_DETAIL, { menu: menuForm.placement });
	};

	const handleValidation = (): boolean => {
		const errors: Partial<MenuEditFormErrorState> = {};

		if (!menuParentId && !menuForm.placement) {
			errors.placement = t('admin/menu/views/menu-edit___navigatie-naam-is-verplicht');
		}

		if (!menuForm.label) {
			errors.label = t('admin/menu/views/menu-edit___label-is-verplicht');
		}

		if (!menuForm.external_link) {
			errors.external_link = t('admin/menu/views/menu-edit___link-is-verplicht');
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
		<AdminLayout navigateBack={navigateBack} pageTitle={pageTitle}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<MenuEditForm
							formErrors={formErrors}
							formState={menuForm}
							menuParentId={menuParentId}
							menuParentOptions={menuParentOptions}
							onChange={handleChange}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					disabled={isSaving}
					label={t('admin/menu/views/menu-edit___opslaan')}
					onClick={handleSave}
				/>
				<Button
					label={t('admin/menu/views/menu-edit___annuleer')}
					onClick={navigateBack}
					type="tertiary"
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default MenuEdit;
