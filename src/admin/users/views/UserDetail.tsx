import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, isEqual, startCase } from 'lodash-es';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Container,
	Flex,
	IconName,
	Spacer,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { navigate } from '../../../shared/helpers';
import { toastService } from '../../../shared/services';
import { ApolloCacheManager } from '../../../shared/services/data-service';

import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { USER_PATH } from '../user.const';
import { DELETE_USER_ITEM, GET_USER_ITEMS_BY_PLACEMENT, UPDATE_USER_ITEM_BY_ID } from '../user.gql';

import './UserDetail.scss';

interface UserDetailProps extends DefaultSecureRouteProps<{ user: string }> {}

const UserDetail: FunctionComponent<UserDetailProps> = ({ history, match }) => {
	const [t] = useTranslation();

	const [activeRow, setActiveRow] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [initialUserItems, setInitialUserItems] = useState<Avo.User.User[]>([]);
	const [userItems, setUserItems] = useState<Avo.User.User[]>([]);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [triggerUserItemDelete] = useMutation(DELETE_USER_ITEM);
	const [triggerUserItemUpdate] = useMutation(UPDATE_USER_ITEM_BY_ID);

	const hasInitialData = useRef<boolean>(false);
	const timeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Reset active row to clear styling
		timeout.current = setTimeout(() => {
			setActiveRow(null);
		}, 1000);

		return () => {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}
		};
	}, [activeRow]);

	// Computed
	const userId = match.params.user;

	// Methods
	const handleDelete = (refetchUserItems: () => void): void => {
		triggerUserItemDelete({
			variables: { id: idToDelete },
			update: ApolloCacheManager.clearNavElementsCache,
		})
			.then(() => {
				refetchUserItems();
				toastService.success(
					t('admin/user/views/user-detail___het-navigatie-item-is-succesvol-verwijderd'),
					false
				);
			})
			.catch(err => {
				console.error(err);
				toastService.danger(
					t(
						'admin/user/views/user-detail___het-verwijderen-van-het-navigatie-item-is-mislukt'
					),
					false
				);
			});
	};

	const handleNavigate = (path: string, params: { [key: string]: string } = {}): void => {
		navigate(history, path, params);
	};

	const handleSave = (refetch: () => void): void => {
		setIsSaving(true);

		const promises: Promise<any>[] = [];
		userItems.forEach(userItem => {
			promises.push(
				triggerUserItemUpdate({
					variables: {
						id: userItem.id,
						userItem: {
							...userItem,
							updated_at: new Date().toISOString(),
						},
					},
					update: ApolloCacheManager.clearNavElementsCache,
				})
			);
		});

		Promise.all(promises)
			.then(() => {
				refetch();
				toastService.success(
					t(
						'admin/user/views/user-detail___de-navigatie-items-zijn-succesvol-opgeslagen'
					),
					false
				);
			})
			.catch(err => {
				console.error(err);
				toastService.danger(
					t(
						'admin/user/views/user-detail___het-opslaan-van-de-navigatie-items-is-mislukt'
					),
					false
				);
			});
	};

	const openConfirmModal = (id: number): void => {
		setIdToDelete(id);
		setIsConfirmModalOpen(true);
	};

	const reindexUseritems = (items: Avo.User.User[]): Avo.User.User[] =>
		items.map((item, index) => {
			item.position = index;
			// Remove properties that we don't need for save
			delete (item as any).__typename;

			return item;
		});

	const reorderUserItem = (currentIndex: number, indexUpdate: number, id: number): void => {
		const newIndex = currentIndex + indexUpdate;
		const userItemsCopy = cloneDeep(userItems);
		// Get updated item and remove it from copy
		const updatedItem = userItemsCopy.splice(currentIndex, 1)[0];
		// Add item back at new index
		userItemsCopy.splice(newIndex, 0, updatedItem);

		setActiveRow(id);
		setUserItems(reindexUseritems(userItemsCopy));
	};

	// Render
	const renderReorderButton = (dir: 'up' | 'down', index: number, id: number) => {
		const decrease = dir === 'up';
		const indexUpdate = decrease ? -1 : 1;

		return (
			<Button
				icon={`chevron-${dir}` as IconName}
				onClick={() => reorderUserItem(index, indexUpdate, id)}
				title={`Verplaats item naar ${decrease ? 'boven' : 'onder'}`}
				type="secondary"
			/>
		);
	};

	const renderUserDetail = (user: Avo.User.User[], refetchUserItems: () => void) => {
		// Return to overview if user is empty
		if (!user.length) {
			toastService.danger(
				t('admin/user/views/user-detail___er-werden-geen-navigatie-items-gevonden'),
				false
			);
			handleNavigate(USER_PATH.USER);
		}

		// Reindex and set initial data
		if (!hasInitialData.current) {
			hasInitialData.current = true;
			// Set items position property equal to index in array
			const reindexedUserItems = reindexUseritems(user);

			setInitialUserItems(reindexedUserItems);
			setUserItems(reindexedUserItems);
		}

		const isFirst = (i: number) => i === 0;
		const isLast = (i: number) => i === userItems.length - 1;

		return (
			<AdminLayout className="c-user-detail" showBackButton pageTitle={startCase(userId)}>
				<AdminLayoutBody>
					<Container mode="vertical" size="small">
						<Container mode="horizontal">
							<Table align className="c-user-detail__table" variant="styled">
								<tbody>
									{userItems.map((item, index) => (
										<tr
											key={`nav-edit-${item.id}`}
											className={
												activeRow === item.id
													? 'c-user-detail__table-row--active'
													: ''
											}
										>
											<td className="o-table-col-1">
												<ButtonToolbar>
													{!isFirst(index) &&
														renderReorderButton('up', index, item.id)}
													{!isLast(index) &&
														renderReorderButton('down', index, item.id)}
												</ButtonToolbar>
											</td>
											<td>{item.label}</td>
											<td>
												<ButtonToolbar>
													<Button
														icon="edit-2"
														onClick={() =>
															handleNavigate(
																USER_PATH.USER_ITEM_EDIT,
																{
																	user: userId,
																	id: String(item.id),
																}
															)
														}
														type="secondary"
													/>
													<Button
														icon="delete"
														onClick={() => openConfirmModal(item.id)}
														type="secondary"
													/>
												</ButtonToolbar>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
							<Spacer margin="top">
								<Flex center>
									<Button
										icon="plus"
										label={t(
											'admin/user/views/user-detail___voeg-een-item-toe'
										)}
										onClick={() =>
											handleNavigate(USER_PATH.USER_ITEM_CREATE, {
												user: userId,
											})
										}
										type="borderless"
									/>
								</Flex>
							</Spacer>
							<DeleteObjectModal
								deleteObjectCallback={() => handleDelete(refetchUserItems)}
								isOpen={isConfirmModalOpen}
								onClose={() => setIsConfirmModalOpen(false)}
							/>
						</Container>
					</Container>
				</AdminLayoutBody>
				<AdminLayoutActions>
					<Button
						label={t('admin/user/views/user-detail___annuleer')}
						onClick={() => handleNavigate(USER_PATH.USER)}
						type="tertiary"
					/>
					<Button
						disabled={isEqual(initialUserItems, userItems) || isSaving}
						label={t('admin/user/views/user-detail___opslaan')}
						onClick={() => handleSave(refetchUserItems)}
					/>
				</AdminLayoutActions>
			</AdminLayout>
		);
	};

	return (
		<DataQueryComponent
			query={GET_USER_ITEMS_BY_PLACEMENT}
			renderData={renderUserDetail}
			resultPath="app_content_nav_elements"
			variables={{ placement: userId }}
		/>
	);
};

export default UserDetail;
