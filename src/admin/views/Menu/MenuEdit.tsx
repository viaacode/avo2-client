import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { ValueType } from 'react-select';

import { useMutation } from '@apollo/react-hooks';
import { Button, Flex, Form, FormGroup, IconName, Spinner, TextInput } from '@viaa/avo2-components';
import { get, startCase } from 'lodash-es';

import { buildLink } from '../../../shared/helpers/generateLink';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import { fetchMenuItemById } from '../../../shared/services/menu-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { ReactSelectOption } from '../../../shared/types/types';
import { AppState } from '../../../store';
import { IconPicker } from '../../components';
import { MENU_ICON_OPTIONS } from '../../constants';
import { INSERT_MENU_ITEM, UPDATE_MENU_ITEM_BY_ID } from '../../graphql';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../layouts';
import { ADMIN_PATH } from '../../routes';
import { selectMenuItems } from '../../store/selectors';
import { MenuItem } from '../../types';

interface MenuEditForm {
	icon: IconName | '';
	label: string;
	link: string;
}

const initialMenuForm = (): MenuEditForm => ({
	icon: '',
	label: '',
	link: '',
});

interface MenuEditProps extends RouteComponentProps<{ menu: string; id?: string }> {
	menuItems: MenuItem[];
}

const MenuEdit: FunctionComponent<MenuEditProps> = ({ history, match, menuItems }) => {
	const [formErrors, setFormErrors] = useState<Partial<MenuEditForm>>({});
	const [menuForm, setMenuForm] = useState<MenuEditForm>(initialMenuForm());
	const [pageType, setPageType] = useState<'edit' | 'create' | undefined>();
	const [initialMenuItem, setInitialMenuItem] = useState<MenuItem | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [insertMenuItem] = useMutation(INSERT_MENU_ITEM);
	const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM_BY_ID);

	useEffect(() => {
		const menuItemId = match.params.id;
		setPageType(menuItemId ? 'edit' : 'create');

		if (menuItemId) {
			setIsLoading(true);
			fetchMenuItemById(Number(menuItemId)).then((menuItem: MenuItem | null) => {
				if (menuItem) {
					// Remove unnecessary props for saving
					delete menuItem.__typename;

					setInitialMenuItem(menuItem);
					setMenuForm({
						icon: menuItem.icon_name,
						label: menuItem.label,
						link: menuItem.link_target || '',
					});
					setIsLoading(false);
				}
			});
		} else {
			setIsLoading(false);
		}
	}, [match.params.id]);

	// Computed
	const menuId = match.params.menu;
	const pageTitle = `${startCase(menuId)}: item ${
		pageType === 'create' ? 'toevoegen' : 'aanpassen'
	}`;

	// Methods
	const handleChange = (key: keyof MenuEditForm, value: any): void => {
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

		// Create
		const { id, menu } = match.params;
		const menuItem: Partial<MenuItem> = {
			icon_name: menuForm.icon,
			label: menuForm.label,
			link_target: menuForm.link,
			placement: menu,
		};

		if (pageType === 'create') {
			insertMenuItem({
				variables: {
					menuItem: {
						...menuItem,
						description: get(menuItems, '[0].description', ''),
						position: menuItems.length,
					},
				},
				update: ApolloCacheManager.clearNavElementsCache,
			})
				.then(() => handleSucces('Het navigatie item is succesvol aangemaakt'))
				.catch(err => handleError('Het aanmaken van het navigatie item is mislukt', err));
		} else {
			updateMenuItem({
				variables: {
					id,
					menuItem: {
						...initialMenuItem,
						...menuItem,
						updated_at: new Date().toISOString(),
					},
				},
				update: ApolloCacheManager.clearNavElementsCache,
			})
				.then(() => handleSucces('Het navigatie item is succesvol geüpdatet'))
				.catch(err => handleError('Het updaten van het navigatie item is mislukt', err));
		}
	};

	const handleError = (message: string, err: any): void => {
		console.error(err);
		setIsSaving(false);
		toastService(message, TOAST_TYPE.DANGER);
	};

	const handleSucces = (message: string): void => {
		const { menu } = match.params;

		setIsSaving(false);
		toastService(message, TOAST_TYPE.SUCCESS);
		history.push(buildLink(ADMIN_PATH.MENU_DETAIL, { menu }));
	};

	const handleValidation = (): boolean => {
		const errors: Partial<MenuEditForm> = {};

		if (!menuForm.label) {
			errors.label = 'Label is verplicht';
		}
		if (!menuForm.link) {
			errors.link = 'Link is verplicht';
		}

		setFormErrors(errors);

		return Object.keys(errors).length === 0;
	};

	const navigateBack = () => {
		history.push(buildLink(ADMIN_PATH.MENU_DETAIL, { menu: menuId }));
	};

	// Render
	return isLoading ? (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	) : (
		<AdminLayout navigateBack={navigateBack} pageTitle={pageTitle}>
			<AdminLayoutBody>
				<Form>
					<FormGroup label="Icoon">
						<IconPicker
							options={MENU_ICON_OPTIONS}
							onChange={(e: ValueType<ReactSelectOption<string>>) =>
								handleChange('icon', get(e, 'value', ''))
							}
							value={MENU_ICON_OPTIONS.find(
								(option: ReactSelectOption<string>) => option.value === menuForm.icon
							)}
						/>
					</FormGroup>
					<FormGroup error={formErrors.label} label="Label" required>
						<TextInput
							onChange={(value: string) => handleChange('label', value)}
							value={menuForm.label}
						/>
					</FormGroup>
					<FormGroup error={formErrors.link} label="Link" required>
						<TextInput
							onChange={(value: string) => handleChange('link', value)}
							value={menuForm.link}
						/>
					</FormGroup>
				</Form>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button disabled={isSaving} label="Opslaan" onClick={handleSave} />
				<Button label="Annuleer" onClick={navigateBack} type="tertiary" />
			</AdminLayoutActions>
		</AdminLayout>
	);
};

const mapStateToProps = (state: AppState) => ({
	menuItems: selectMenuItems(state),
});

export default withRouter(connect(mapStateToProps)(MenuEdit));
