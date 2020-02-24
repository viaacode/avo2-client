import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-boost';
import { get, isEmpty, isNil, remove } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Alert,
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	DatePicker,
	Dropdown,
	DropdownButton,
	DropdownContent,
	DutchContentType,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Icon,
	Navbar,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	TagOption,
	TextInput,
	Thumbnail,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileId, getProfileName } from '../../authentication/helpers/get-profile-info';
import { PermissionNames } from '../../authentication/helpers/permission-service';
import { INSERT_COLLECTION, INSERT_COLLECTION_FRAGMENTS } from '../../collection/collection.gql';
import { toEnglishContentType } from '../../collection/collection.types';
import {
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
} from '../../shared/components';
import { renderDropdownButton } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ROUTE_PARTS } from '../../shared/constants';
import { buildLink, copyToClipboard, CustomError, navigate } from '../../shared/helpers';
import { toastService } from '../../shared/services';
import { dataService } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ASSIGNMENTS_ID, WORKSPACE_PATH } from '../../workspace/workspace.const';

import {
	checkPermissions,
	LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { ASSIGNMENT_PATH, CONTENT_LABEL_TO_QUERY } from '../assignment.const';
import { DELETE_ASSIGNMENT, INSERT_ASSIGNMENT } from '../assignment.gql';
import { AssignmentService } from '../assignment.service';
import { AssignmentLayout } from '../assignment.types';
import './AssignmentEdit.scss';

const CONTENT_LABEL_TO_ROUTE_PARTS: { [contentType in Avo.Assignment.ContentLabel]: string } = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

const CONTENT_LABEL_TO_EVENT_OBJECT_TYPE: {
	[contentType in Avo.Assignment.ContentLabel]: Avo.EventLogging.ObjectType;
} = {
	ITEM: 'avo_item_pid',
	COLLECTIE: 'collections',
	ZOEKOPDRACHT: 'avo_search_query' as any, // TODO add this object type to the database
};

interface AssignmentCreateProps extends DefaultSecureRouteProps {}

const AssignmentCreate: FunctionComponent<AssignmentCreateProps> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [assignmentContent, setAssignmentContent] = useState<Avo.Assignment.Content | undefined>(
		undefined
	);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tagsDropdownOpen, setTagsDropdownOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [isDuplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [currentAssignment, setCurrentAssignment] = useState<Partial<Avo.Assignment.Assignment>>(
		{}
	);
	const [initialAssignment, setInitialAssignment] = useState<Partial<Avo.Assignment.Assignment>>(
		{}
	);

	const [triggerAssignmentDelete] = useMutation(DELETE_ASSIGNMENT);
	const [triggerAssignmentInsert] = useMutation(INSERT_ASSIGNMENT);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);

	const setBothAssignments = useCallback(
		(assignment: Partial<Avo.Assignment.Assignment>) => {
			setCurrentAssignment(assignment);
			setInitialAssignment(assignment);
		},
		[setCurrentAssignment, setInitialAssignment]
	);

	/**
	 *  Get query string variables and store them into the assignment state object
	 */
	useEffect(() => {
		const initAssignmentData = async () => {
			try {
				const tempAssignment = initAssignmentsByQueryParams();
				await fetchAssignmentContent(tempAssignment);
				setBothAssignments(tempAssignment);
			} catch (err) {
				setLoadingInfo({
					state: 'error',
					message: t(
						'assignment/views/assignment-edit___het-ophalen-aanmaken-van-de-opdracht-is-mislukt'
					),
					icon: 'alert-triangle',
				});
			}
		};

		/**
		 * Get assignment_type, content_id and content_label from query params
		 */
		const initAssignmentsByQueryParams = (): Partial<Avo.Assignment.Assignment> => {
			const queryParams = queryString.parse(location.search);
			let newAssignment: Partial<Avo.Assignment.Assignment> = {};

			if (typeof queryParams.assignment_type === 'string') {
				newAssignment = {
					assignment_type: queryParams.assignment_type as Avo.Assignment.Type,
				};
			}

			if (typeof queryParams.content_id === 'string') {
				newAssignment = {
					...(newAssignment || {}),
					content_id: queryParams.content_id,
				};
			}

			if (typeof queryParams.content_label === 'string') {
				newAssignment = {
					...(newAssignment || {}),
					content_label: queryParams.content_label as Avo.Assignment.ContentLabel,
				};
			}

			if (!newAssignment.assignment_type) {
				throw new CustomError('Failed to create assignment without assigment type');
			}

			return newAssignment;
		};

		/**
		 * Load the content if they are not loaded yet
		 */
		const fetchAssignmentContent = async (assignment: Partial<Avo.Assignment.Assignment>) => {
			try {
				if (!assignment.assignment_type) {
					// Only fetch assignment content if not set yet
					return;
				}

				let assignmentContentResponse: Avo.Assignment.Content | undefined = undefined;
				if (assignment.content_id && assignment.content_label) {
					// The assignment doesn't have content linked to it
					// Fetch the content from the network
					const queryParams = {
						query:
							CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel].query,
						variables: { id: assignment.content_id },
					};
					const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query(
						queryParams
					);

					assignmentContentResponse = get(
						response,
						`data.${
							CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel]
								.resultPath
						}`
					);
					if (!assignmentContentResponse) {
						console.error('Failed to fetch the assignment content', { response, ...queryParams });
						setLoadingInfo({
							state: 'error',
							message: t(
								'assignment/views/assignment-edit___het-ophalen-van-de-opdracht-inhoud-is-mislukt-leeg-antwoord'
							),
							icon: 'search',
						});
					}
				}

				setAssignmentContent(assignmentContentResponse);
			} catch (err) {
				console.error(err);
				toastService.danger(
					t('assignment/views/assignment-create___het-ophalen-van-de-opdracht-inhoud-is-mislukt')
				);
			}
		};

		checkPermissions(
			PermissionNames.CREATE_ASSIGNMENTS,
			user,
			initAssignmentData,
			setLoadingInfo,
			t('assignment/views/assignment-create___je-hebt-geen-rechten-om-een-opdracht-te-maken')
		);
	}, [location, match.params, setLoadingInfo, setAssignmentContent, t, user, setBothAssignments]);

	useEffect(() => {
		if (
			!isEmpty(initialAssignment) &&
			!isEmpty(currentAssignment) &&
			(isNil(currentAssignment.content_id) || !isEmpty(assignmentContent))
		) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [initialAssignment, currentAssignment, assignmentContent]);

	const deleteCurrentAssignment = async () => {
		try {
			if (typeof currentAssignment.id === 'undefined') {
				toastService.danger(
					t(
						'assignment/views/assignment-edit___de-huidige-opdracht-is-nog-nooit-opgeslagen-geen-id'
					)
				);
				return;
			}
			await AssignmentService.deleteAssignment(triggerAssignmentDelete, currentAssignment.id);
			navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: ASSIGNMENTS_ID });
			toastService.success(t('assignment/views/assignment-edit___de-opdracht-is-verwijderd'));
		} catch (err) {
			console.error(err);
			toastService.danger(
				t('assignment/views/assignment-edit___het-verwijderen-van-de-opdracht-is-mislukt')
			);
		}
	};

	const getAssignmentUrl = (absolute: boolean = true) => {
		return `${absolute ? window.location.origin : ''}/${ROUTE_PARTS.assignments}/${
			currentAssignment.id
		}`;
	};

	const copyAssignmentUrl = () => {
		copyToClipboard(getAssignmentUrl());
		toastService.success(
			t('assignment/views/assignment-edit___de-url-is-naar-het-klembord-gekopieerd')
		);

		if (currentAssignment.id) {
			trackEvents(
				{
					object: String(currentAssignment.id),
					object_type: 'avo_assignment' as any, // TODO add this object type to the database
					message: `Gebruiker ${getProfileName(user)} heeft de permalink voor opdracht ${
						currentAssignment.id
					} gekopieert`,
					action: 'view',
				},
				user
			);
		}
	};

	const attemptDuplicateAssignment = async (
		newTitle: string,
		assignment: Partial<Avo.Assignment.Assignment>
	) => {
		try {
			if (isNil(assignment.id)) {
				toastService.danger('Je kan een opdracht pas dupliceren nadat je hem hebt opgeslagen.');
				return;
			}
			const duplicatedAssigment = await AssignmentService.duplicateAssignment(
				newTitle,
				assignment,
				user,
				triggerCollectionInsert,
				triggerCollectionFragmentsInsert,
				triggerAssignmentInsert
			);

			setCurrentAssignment({});
			setLoadingInfo({ state: 'loading' });

			navigate(history, ASSIGNMENT_PATH.ASSIGNMENT_EDIT, { id: duplicatedAssigment.id });
			toastService.success(
				t(
					'assignment/views/assignment-edit___de-opdracht-is-succesvol-gedupliceerd-u-kijkt-nu-naar-het-duplicaat'
				)
			);
		} catch (err) {
			console.error('Failed to copy the assignment', err);
			toastService.danger(
				t('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
			);
		}
	};

	const setAssignmentProp = (property: keyof Avo.Assignment.Assignment, value: any) => {
		const newAssignment = {
			...currentAssignment,
			[property]: value,
		};
		setCurrentAssignment(newAssignment);
	};

	const trackAddObjectToAssignment = (assignment: Avo.Assignment.Assignment) => {
		if (!assignment.content_label || !assignment.content_id) {
			return;
		}
		trackEvents(
			{
				object: assignment.content_id,
				object_type: CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label],
				message: `Gebruiker ${getProfileName(user)} heeft ${
					CONTENT_LABEL_TO_EVENT_OBJECT_TYPE[assignment.content_label]
				} ${assignment.content_id} toegevoegd aan opdracht ${assignment.id}`,
				action: 'view',
			},
			user
		);
	};

	const saveAssignment = async (assignment: Partial<Avo.Assignment.Assignment>) => {
		try {
			setIsSaving(true);

			// Copy content if it's a collection collection if not owned by logged in user
			// so your assignment can work after the other user deletes his collection
			if (
				assignment.content_label === 'COLLECTIE' &&
				(assignmentContent as Avo.Collection.Collection).owner_profile_id !== getProfileId(user)
			) {
				const sourceCollection = assignmentContent as Avo.Collection.Collection;
				assignment.content_id = await AssignmentService.duplicateCollectionForAssignment(
					sourceCollection,
					user,
					triggerCollectionInsert,
					triggerCollectionFragmentsInsert
				);
			}

			// create => insert into graphql
			const newAssignment: Avo.Assignment.Assignment = {
				...assignment,
				owner_profile_id: getProfileId(user),
			} as Avo.Assignment.Assignment;
			const insertedAssignment = await AssignmentService.insertAssignment(
				triggerAssignmentInsert,
				newAssignment
			);

			if (insertedAssignment) {
				setBothAssignments(insertedAssignment);
				trackAddObjectToAssignment(insertedAssignment);
				toastService.success(
					t('assignment/views/assignment-edit___de-opdracht-is-succesvol-aangemaakt')
				);
				navigate(history, ASSIGNMENT_PATH.ASSIGNMENT_EDIT, { id: insertedAssignment.id });
			}
			setIsSaving(false);
		} catch (err) {
			console.error(err);
			toastService.danger(
				t('assignment/views/assignment-edit___het-opslaan-van-de-opdracht-is-mislukt')
			);
			setIsSaving(false);
		}
	};

	const isDeadlineInThePast = (): boolean => {
		return (
			!!currentAssignment.deadline_at &&
			new Date(currentAssignment.deadline_at) < new Date(Date.now())
		);
	};

	const getTagOptions = (): TagOption[] => {
		return get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []).map(
			(assignmentTag: Avo.Assignment.Tag) => {
				return {
					label: assignmentTag.label,
					id: assignmentTag.id,
					// assignmentTag.enum_color.label contains hex code (graphql enum quirk)
					// The value of the enum has to be uppercase text, so the value contains the color name
					color: assignmentTag.color_override || assignmentTag.enum_color.label,
				};
			}
		);
	};

	const removeTag = (tagId: string | number, evt: MouseEvent) => {
		evt.stopPropagation();
		const tags: Avo.Assignment.Tag[] = [
			...get(currentAssignment, 'assignment_assignment_tags.assignment_tag', []),
		];
		remove(tags, (tag: Avo.Assignment.Tag) => tag.id === tagId);
		setCurrentAssignment({
			...currentAssignment,
			assignment_assignment_tags: {
				assignment_tag: tags,
			},
		});
	};

	const renderTagsDropdown = () => {
		const tags = getTagOptions();

		return (
			<Dropdown
				isOpen={tagsDropdownOpen}
				menuWidth="fit-content"
				onOpen={() => setTagsDropdownOpen(true)}
				onClose={() => setTagsDropdownOpen(false)}
			>
				<DropdownButton>
					{renderDropdownButton(
						tags.length ? '' : t('assignment/views/assignment-edit___geen'),
						false,
						tags,
						removeTag
					)}
				</DropdownButton>
				<DropdownContent>
					<Spacer>
						<Form>
							<Button
								type="borderless"
								block
								label={t('assignment/views/assignment-edit___geen')}
							/>
							<Button
								type="borderless"
								block
								label={t('assignment/views/assignment-edit___beheer-vakken-en-projecten')}
							/>
						</Form>
					</Spacer>
				</DropdownContent>
			</Dropdown>
		);
	};

	const renderContentLink = (content: Avo.Assignment.Content) => {
		const dutchLabel = get(
			content,
			'type.label',
			(currentAssignment.content_label || '').toLowerCase()
		) as DutchContentType;
		const linkContent = (
			<div className="c-box c-box--padding-small">
				<Flex orientation="vertical" center>
					<Spacer margin="right">
						<Thumbnail
							className="m-content-thumbnail"
							category={toEnglishContentType(dutchLabel)}
							src={content.thumbnail_path || undefined}
						/>
					</Spacer>
					<FlexItem>
						<div className="c-overline-plus-p">
							<p className="c-overline">{dutchLabel}</p>
							<p>{content.title || content.description}</p>
						</div>
					</FlexItem>
				</Flex>
			</div>
		);

		if (
			currentAssignment.content_label === 'COLLECTIE' &&
			getProfileId(user) !== (content as Avo.Collection.Collection).owner_profile_id
		) {
			// During create we do not allow linking to the collection if you do not own the collection,
			// since we still need to make a copy when the user clicks on "save assignment" button
			return (
				<div
					title={t(
						'assignment/views/assignment-edit___u-kan-pas-doorklikken-naar-de-collectie-nadat-u-de-opdracht-hebt-aangemaakt'
					)}
				>
					{linkContent}
				</div>
			);
		}

		return (
			<Link
				to={`/${
					CONTENT_LABEL_TO_ROUTE_PARTS[
						currentAssignment.content_label as Avo.Assignment.ContentLabel
					]
				}/${currentAssignment.content_id}`}
			>
				{linkContent}
			</Link>
		);
	};

	const renderAssignmentEditForm = () => {
		const now = new Date(Date.now());

		return (
			<>
				<Navbar autoHeight>
					<Container mode="vertical" background="alt">
						<Container mode="horizontal">
							<Toolbar autoHeight className="c-toolbar--drop-columns-low-mq">
								<ToolbarLeft>
									<ToolbarItem grow>
										<Link
											className="c-return"
											to={buildLink(WORKSPACE_PATH.WORKSPACE_TAB, {
												tabId: ASSIGNMENTS_ID,
											})}
										>
											<Icon name="chevron-left" size="small" type="arrows" />
											<Trans i18nKey="assignment/views/assignment-edit___mijn-opdrachten">
												Mijn opdrachten
											</Trans>
										</Link>
										<BlockHeading className="u-m-0" type="h2">
											{t('assignment/views/assignment-edit___nieuwe-opdracht')}
										</BlockHeading>
										{currentAssignment.id && (
											<Spacer margin="top-small">
												<Form type="inline">
													<FormGroup label={t('assignment/views/assignment-edit___url')}>
														<TextInput value={getAssignmentUrl()} disabled />
													</FormGroup>
													<Spacer margin="left-small">
														<Button
															icon="copy"
															type="secondary"
															ariaLabel={t(
																'assignment/views/assignment-edit___kopieer-de-opdracht-url'
															)}
															onClick={copyAssignmentUrl}
														/>
													</Spacer>
												</Form>
											</Spacer>
										)}
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarRight>
									<ToolbarItem>
										<ButtonToolbar>
											<Button
												type="secondary"
												onClick={() => history.goBack()}
												label={t('assignment/views/assignment-edit___annuleren')}
											/>
											<Button
												type="primary"
												label={t('assignment/views/assignment-edit___opslaan')}
												onClick={() => saveAssignment(currentAssignment)}
												disabled={isSaving}
											/>
										</ButtonToolbar>
									</ToolbarItem>
								</ToolbarRight>
							</Toolbar>
						</Container>
					</Container>
				</Navbar>
				<Container mode="horizontal" size="small" className="c-assignment-edit">
					<Container mode="vertical" size="large">
						<Form>
							<FormGroup required label={t('assignment/views/assignment-edit___titel')}>
								<TextInput
									id="title"
									value={currentAssignment.title}
									onChange={title => setAssignmentProp('title', title)}
								/>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___opdracht')} required>
								<WYSIWYG
									id="assignmentDescription"
									autogrow
									data={currentAssignment.description}
									onChange={description => setAssignmentProp('description', description)}
								/>
							</FormGroup>
							{assignmentContent && currentAssignment.content_label && (
								<FormGroup label={t('assignment/views/assignment-edit___inhoud')}>
									{renderContentLink(assignmentContent)}
								</FormGroup>
							)}
							<FormGroup
								label={t('assignment/views/assignment-edit___weergave')}
								labelFor="only_player"
							>
								<RadioButtonGroup>
									<RadioButton
										label={t('assignment/views/assignment-edit___mediaspeler-met-beschrijving')}
										name="content_layout"
										value={String(AssignmentLayout.PlayerAndText)}
										checked={currentAssignment.content_layout === AssignmentLayout.PlayerAndText}
										onChange={isChecked =>
											isChecked &&
											setAssignmentProp('content_layout', AssignmentLayout.PlayerAndText)
										}
									/>
									<RadioButton
										label={t('assignment/views/assignment-edit___enkel-mediaspeler')}
										name="content_layout"
										value={String(AssignmentLayout.OnlyPlayer)}
										checked={currentAssignment.content_layout === AssignmentLayout.OnlyPlayer}
										onChange={isChecked =>
											isChecked && setAssignmentProp('content_layout', AssignmentLayout.OnlyPlayer)
										}
									/>
								</RadioButtonGroup>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___klas-of-groep')} required>
								<TextInput
									id="class_room"
									value={currentAssignment.class_room || ''}
									onChange={classRoom => setAssignmentProp('class_room', classRoom)}
								/>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___vak-of-project')}>
								{renderTagsDropdown()}
							</FormGroup>
							<FormGroup
								label={t('assignment/views/assignment-edit___antwoorden-op')}
								labelFor="answer_url"
							>
								<TextInput
									id="answer_url"
									type="text"
									placeholder={t('assignment/views/assignment-edit___http')}
									value={currentAssignment.answer_url || ''}
									onChange={value => setAssignmentProp('answer_url', value)}
								/>
								<p className="c-form-help-text">
									<Trans i18nKey="assignment/views/assignment-edit___waar-geeft-de-leerling-de-antwoorden-in-voeg-een-optionele-url-naar-een-ander-platform-toe">
										Waar geeft de leerling de antwoorden in? Voeg een optionele URL naar een ander
										platform toe.
									</Trans>
								</p>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___beschikbaar-vanaf')}>
								<Flex>
									<DatePicker
										value={
											currentAssignment.available_at
												? new Date(currentAssignment.available_at)
												: now
										}
										onChange={(value: Date | null) =>
											setAssignmentProp('available_at', value ? value.toISOString() : null)
										}
										showTimeInput
									/>
								</Flex>
							</FormGroup>
							<FormGroup label={t('assignment/views/assignment-edit___deadline')} required>
								<Flex>
									<Spacer margin="right-small">
										<DatePicker
											value={
												currentAssignment.deadline_at
													? new Date(currentAssignment.deadline_at)
													: null
											}
											onChange={value => setAssignmentProp('deadline_at', value)}
											showTimeInput
										/>
									</Spacer>
								</Flex>
								{isDeadlineInThePast() ? (
									<div className="c-form-help-text c-form-help-text--error">
										<Trans i18nKey="assignment/views/assignment-edit___de-deadline-ligt-in-het-verleden">
											De deadline ligt in het verleden.
										</Trans>
										<br />
										<Trans i18nKey="assignment/views/assignment-edit___de-leerlingen-zullen-dus-geen-toegang-hebben-tot-deze-opdracht">
											De leerlingen zullen dus geen toegang hebben tot deze opdracht
										</Trans>
									</div>
								) : (
									<p className="c-form-help-text">
										<Trans i18nKey="assignment/views/assignment-edit___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen">
											Na deze datum kan de leerling de opdracht niet meer invullen.
										</Trans>
									</p>
								)}
							</FormGroup>
							{currentAssignment.assignment_type === 'BOUW' && (
								<FormGroup
									label={t('assignment/views/assignment-edit___groepswerk')}
									labelFor="only_player"
								>
									<Toggle
										checked={currentAssignment.is_collaborative}
										onChange={checked => setAssignmentProp('is_collaborative', checked)}
									/>
								</FormGroup>
							)}
							<hr className="c-hr" />
							<Alert type="info">
								<div className="c-content c-content--no-m">
									<p>
										<Trans i18nKey="assignment/views/assignment-edit___hulp-nodig-bij-het-maken-van-opdrachten">
											Hulp nodig bij het maken van opdrachten?
										</Trans>
										<br />
										Bekijk onze{' '}
										<a href="http://google.com" target="_blank" rel="noopener noreferrer">
											<Trans i18nKey="assignment/views/assignment-edit___screencast">
												screencast
											</Trans>
										</a>
										.
									</p>
								</div>
							</Alert>
						</Form>
					</Container>
				</Container>
				<Container background="alt" mode="vertical">
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>
										<Button
											type="primary"
											label={t('assignment/views/assignment-edit___opslaan')}
											onClick={() => saveAssignment(currentAssignment)}
											disabled={isSaving}
										/>
									</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>

				<DeleteObjectModal
					title={t(
						'assignment/views/assignment-edit___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen'
					)}
					body={t('assignment/views/assignment-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden')}
					isOpen={isDeleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					deleteObjectCallback={deleteCurrentAssignment}
				/>

				<InputModal
					title={t('assignment/views/assignment-edit___dupliceer-taak')}
					inputLabel={t('assignment/views/assignment-edit___geef-de-nieuwe-taak-een-naam')}
					inputValue={currentAssignment.title}
					inputPlaceholder={t('assignment/views/assignment-edit___titel-van-de-nieuwe-taak')}
					isOpen={isDuplicateModalOpen}
					onClose={() => setDuplicateModalOpen(false)}
					inputCallback={(newTitle: string) =>
						attemptDuplicateAssignment(newTitle, currentAssignment)
					}
					emptyMessage={t(
						'assignment/views/assignment-edit___gelieve-een-opdracht-titel-in-te-geven'
					)}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			dataObject={currentAssignment}
			render={renderAssignmentEditForm}
			loadingInfo={loadingInfo}
			notFoundError={t('assignment/views/assignment-edit___de-opdracht-is-niet-gevonden')}
		/>
	);
};

export default AssignmentCreate;
