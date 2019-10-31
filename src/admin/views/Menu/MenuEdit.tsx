import React, { FunctionComponent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Form, FormGroup, IconName, TextInput } from '@viaa/avo2-components';

import { buildLink } from '../../../shared/helpers/generateLink';
import { ActionsBar } from '../../components';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../layouts';
import { ADMIN_PATH } from '../../routes';
import { fetchMenuItemById } from '../../services/menu-service';
import { MenuItem } from '../../types';

interface MenuEditForm {
	icon?: string;
	label: string;
	link: string;
}

const initialMenuForm = (): MenuEditForm => ({
	icon: '',
	label: '',
	link: '',
});

interface MenuEditProps extends RouteComponentProps<{ menu: string; id?: string }> {}

const MenuEdit: FunctionComponent<MenuEditProps> = ({ history, match }) => {
	const [menuForm, setMenuForm] = useState(initialMenuForm());
	const [pageType, setPageType] = useState<'edit' | 'create' | undefined>();
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const menuItemId = match.params.id;
		setPageType(menuItemId ? 'edit' : 'create');

		if (menuItemId) {
			fetchMenuItemById(Number(menuItemId)).then((menuItem: MenuItem | null) => {
				console.log(menuItem);

				if (menuItem) {
					setMenuForm({
						icon: menuItem.icon_name as IconName,
						label: menuItem.label,
						link: menuItem.link_target || '',
					});
				}
			});
		}
	}, [match.params.id]);

	// Computed
	const menuId = match.params.menu;

	// Methods
	const handleChange = (key: keyof MenuEditForm, value: any) => {
		setMenuForm({
			...menuForm,
			[key]: value,
		});
	};

	const handleSave = () => {
		setIsSaving(true);
	};

	// Render
	return (
		<AdminLayout pageTitle={`Menu item ${pageType === 'create' ? 'toevoegen' : 'aanapassen'}`}>
			<AdminLayoutBody>
				<Form>
					<FormGroup label="Icon">
						<TextInput onChange={(e: any) => handleChange('icon', e)} value={menuForm.icon} />
					</FormGroup>
					<FormGroup label="Label" required>
						<TextInput onChange={(e: any) => handleChange('label', e)} value={menuForm.label} />
					</FormGroup>
					<FormGroup label="Link" required>
						<TextInput onChange={(e: any) => handleChange('link', e)} value={menuForm.link} />
					</FormGroup>
				</Form>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<ActionsBar>
					<ButtonToolbar>
						<Button disabled={isSaving} label="Opslaan" onClick={handleSave} />
						<Button
							label="Annuleer"
							onClick={() => history.push(buildLink(ADMIN_PATH.MENU_DETAIL, { menu: menuId }))}
							type="tertiary"
						/>
					</ButtonToolbar>
				</ActionsBar>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default withRouter(MenuEdit);
