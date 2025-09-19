import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Alert,
	Button,
	ButtonToolbar,
	Column,
	Container,
	DatePicker,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Grid,
	IconName,
	Select,
	Spacer,
	Spinner,
	Table,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { compact, get, isNil } from 'lodash-es';
import React, { type FC, type ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { commonUserAtom } from '../../authentication/authentication.store';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
	GET_MARCOM_ENTRY_TABLE_COLUMNS,
} from '../../collection/collection.const';
import {
	type AssignmentMarcomEntry,
	CollectionCreateUpdateTab,
} from '../../collection/collection.types';
import { type MarcomNoteInfo } from '../../collection/components/CollectionOrBundleEdit.types';
import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers/build-link';
import { getEnv } from '../../shared/helpers/env';
import { extractKlascementError } from '../../shared/helpers/extract-klascement-error';
import { formatDate } from '../../shared/helpers/formatters';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { useDeleteAssignmentMarcomEntry } from '../hooks/useDeleteAssignmentMarcomEntry';
import { useGetAssignmentMarcomEntries } from '../hooks/useGetAssignmentMarcomEntries';
import { useGetKlascementAssignmentPublishInfo } from '../hooks/useGetKlascementAssignmentPublishInfo';
import { useInsertAssignmentMarcomEntry } from '../hooks/useInsertAssignmentMarcomEntry';
import { usePublishAssignmentToKlascement } from '../hooks/usePublishAssignmentToKlascement';

interface AssignmentEditMarcomProps {
	assignment: Avo.Assignment.Assignment & { marcom_note?: MarcomNoteInfo };
	setAssignment: (
		newAssignment: Avo.Assignment.Assignment & { marcom_note: MarcomNoteInfo }
	) => void;
	onFocus?: () => void;
}

export const AssignmentEditMarcom: FC<AssignmentEditMarcomProps> = ({
	assignment,
	setAssignment,
	onFocus,
}) => {
	const { tText, tHtml } = useTranslation();
	const commonUser = useAtomValue(commonUserAtom);

	const [marcomDate, setMarcomDate] = useState<Date | null>(new Date());
	const [marcomChannelType, setMarcomChannelType] = useState<string | null>();
	const [marcomChannelName, setMarcomChannelName] = useState<string | null>();
	const [marcomLink, setMarcomLink] = useState<string>('');

	const { data: marcomEntries, refetch: refetchMarcomEntries } = useGetAssignmentMarcomEntries(
		assignment.id
	);
	const { mutateAsync: insertMarcomEntry } = useInsertAssignmentMarcomEntry();
	const { mutateAsync: deleteMarcomEntry } = useDeleteAssignmentMarcomEntry();

	const { mutateAsync: publishAssignmentToKlascement, isLoading: isPublishing } =
		usePublishAssignmentToKlascement();

	const { data: publishInfo, refetch: refetchPublishInfo } =
		useGetKlascementAssignmentPublishInfo(assignment.id, {
			enabled:
				commonUser?.permissions?.includes(
					PermissionName.PUBLISH_ASSIGNMENT_TO_KLASCEMENT
				) || false,
		});
	const isPublishedToKlascement = useMemo(
		() => !isNil(publishInfo?.klascement_id),
		[publishInfo]
	);

	const handlePublish = async () => {
		try {
			const klascementId = await publishAssignmentToKlascement(assignment.id);
			window.open(
				`${getEnv('KLASCEMENT_URL')}/oefeningen/${klascementId}/aanpassen/uitgebreid`,
				'_blank'
			);
			await refetchPublishInfo();
			await refetchMarcomEntries();
			ToastService.success(
				tText('assignment/views/assignment-edit-marcom___publiceren-naar-klascement-gelukt')
			);
		} catch (err) {
			const avoError = tText(
				'assignment/views/assignment-edit-marcom___publiceren-naar-klascement-mislukt'
			);
			ToastService.danger(compact([avoError, extractKlascementError(err)]).join(': '));
		}
	};

	const renderMarcomTableCell = (
		rowData: Partial<AssignmentMarcomEntry>,
		columnId: keyof AssignmentMarcomEntry | typeof ACTIONS_TABLE_COLUMN_ID
	): ReactNode => {
		const value = (rowData as any)?.[columnId];
		switch (columnId) {
			case 'publish_date':
				return formatDate(value) || '-';

			case 'external_link': {
				const valueLink: string = (value || '').includes('//') ? value || '' : `//${value}`;
				return value ? (
					<a href={valueLink} target="_blank" rel="noopener noreferrer">
						{truncateTableValue(value)}
					</a>
				) : (
					'-'
				);
			}

			case 'channel_type':
				return truncateTableValue(
					GET_MARCOM_CHANNEL_TYPE_OPTIONS().find((option) => option.value === value)
						?.label || '-'
				);

			case 'channel_name':
				return truncateTableValue(
					GET_MARCOM_CHANNEL_NAME_OPTIONS().find((option) => option.value === value)
						?.label || '-'
				);

			case 'parent_collection':
				return value ? (
					<Link
						to={buildLink(APP_PATH.BUNDLE_EDIT_TAB.route, {
							id: get(value, 'id'),
							tabId: CollectionCreateUpdateTab.MARCOM,
						})}
					>
						<span>{get(value, 'title')}</span>
					</Link>
				) : (
					''
				);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<ButtonToolbar>
						<Button
							icon={IconName.delete}
							onClick={async () => {
								await deleteMarcomEntry({
									assignmentId: assignment.id,
									marcomEntryId: rowData.id,
								});
								await refetchMarcomEntries();
								ToastService.success(
									tHtml(
										'assignment/views/assignment-edit-marcom___het-verwijderen-van-de-marcom-entry-is-gelukt'
									)
								);
							}}
							size="small"
							title={tText(
								'assignment/views/assignment-edit-marcom___verwijder-de-marcom-entry'
							)}
							ariaLabel={tText(
								'assignment/views/assignment-edit-marcom___verwijder-de-marcom-entry'
							)}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return truncateTableValue(value) || '-';
		}
	};

	const addMarcomEntry = async () => {
		const marcomEntry: AssignmentMarcomEntry = {
			channel_type: marcomChannelType || null,
			channel_name: marcomChannelName || null,
			assignment_id: assignment.id,
			external_link: marcomLink.trim() || null,
			publish_date: marcomDate?.toISOString(),
		};
		await insertMarcomEntry(marcomEntry);
		await refetchMarcomEntries();
		ToastService.success(
			tHtml(
				'assignment/views/assignment-edit-marcom___het-toevoegen-van-de-marcom-entry-is-gelukt'
			)
		);

		setMarcomChannelType(null);
		setMarcomChannelName(null);
		setMarcomLink('');
	};

	const getEmptyMarcomTableMessage = () => {
		// Assignment
		// Without filters
		return tText(
			'assignment/views/assignment-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-opdracht'
		);
	};

	const renderExistingMarcomEntries = () => {
		return (
			<>
				<BlockHeading type="h3" className="u-padding-top u-padding-bottom">
					{tText('assignment/views/assignment-edit-marcom___eerdere-communicatie')}
				</BlockHeading>
				{marcomEntries ? (
					<>
						<Table
							data={marcomEntries}
							columns={GET_MARCOM_ENTRY_TABLE_COLUMNS(true)}
							renderCell={renderMarcomTableCell as any}
							emptyStateMessage={getEmptyMarcomTableMessage()}
							rowKey="id"
						/>
					</>
				) : (
					<Spacer margin={['top-large', 'bottom-large']}>
						<Flex center>
							<Spinner size="large" />
						</Flex>
					</Spacer>
				)}
			</>
		);
	};

	const renderCreateNewMarcomEntryForm = () => {
		return (
			<>
				<BlockHeading type="h3">
					{tText('assignment/views/assignment-edit-marcom___meest-recente-communicatie')}
				</BlockHeading>
				<Flex justify="between" spaced="wide">
					<FlexItem>
						<FormGroup
							label={tText(
								'assignment/views/assignment-edit-marcom___datum-communicatie'
							)}
						>
							<DatePicker onChange={setMarcomDate} value={marcomDate} />
						</FormGroup>
					</FlexItem>
					<FlexItem>
						<FormGroup
							label={tText('assignment/views/assignment-edit-marcom___kanaal-type')}
						>
							<Select
								options={GET_MARCOM_CHANNEL_TYPE_OPTIONS()}
								placeholder={'-'}
								onChange={setMarcomChannelType}
								value={marcomChannelType}
								clearable
							/>
						</FormGroup>
					</FlexItem>
					<FlexItem>
						<FormGroup
							label={tText('assignment/views/assignment-edit-marcom___kanaal-naam')}
						>
							<Select
								options={GET_MARCOM_CHANNEL_NAME_OPTIONS()}
								placeholder={'-'}
								onChange={setMarcomChannelName}
								value={marcomChannelName}
								clearable
							/>
						</FormGroup>
					</FlexItem>
					<FlexItem>
						<FormGroup label={tText('assignment/views/assignment-edit-marcom___link')}>
							<TextInput
								onChange={setMarcomLink}
								value={marcomLink || undefined}
								onFocus={onFocus}
							/>
						</FormGroup>
					</FlexItem>
					<FlexItem>
						<FormGroup label=" ">
							<Button
								label={tText('assignment/views/assignment-edit-marcom___toevoegen')}
								onClick={addMarcomEntry}
								type="primary"
							/>
						</FormGroup>
					</FlexItem>
				</Flex>
			</>
		);
	};

	const renderMarcomRemarksField = () => {
		return (
			<FormGroup label={tText('assignment/views/assignment-edit-marcom___opmerkingen')}>
				<TextArea
					value={assignment?.marcom_note?.note || ''}
					onChange={(newNote: string) => {
						setAssignment({
							...assignment,
							marcom_note: {
								id: assignment?.marcom_note?.id || null,
								note: newNote,
								assignment_id: assignment.id,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							},
						});
					}}
					onFocus={onFocus}
				/>
			</FormGroup>
		);
	};

	const renderPublishToKlascementHeader = () => {
		return (
			<BlockHeading type="h3" className="u-padding-top-xl u-padding-bottom">
				{tText('assignment/views/assignment-edit-marcom___publiceren-naar-klascement')}
			</BlockHeading>
		);
	};

	const renderPublishToKlascementForm = () => {
		if (!assignment.is_public) {
			return (
				<>
					{renderPublishToKlascementHeader()}
					<Alert type="info">
						{tHtml(
							'assignment/views/assignment-edit-marcom___je-kan-enkel-publiceren-naar-klascement-als-deze-opdracht-publiek-staat'
						)}
					</Alert>
				</>
			);
		}

		const disablePublishButton = isPublishedToKlascement || isPublishing;
		let publishButtonTooltip = undefined;
		if (isPublishedToKlascement) {
			publishButtonTooltip = tText(
				'assignment/views/assignment-edit-marcom___de-opdracht-is-reeds-gepubliceerd-naar-klascement-bewerk-het-leermiddel-daar'
			);
		} else if (isPublishing) {
			publishButtonTooltip = tText(
				'assignment/views/assignment-edit-marcom___bezig-met-publiceren-naar-klascement'
			);
		}

		return (
			<>
				{renderPublishToKlascementHeader()}
				<Grid>
					<Column size="3-6">
						<Button
							label={tText(
								'assignment/views/assignment-edit-marcom___publiceer-naar-klascement'
							)}
							icon={IconName.klascement}
							type="primary"
							disabled={disablePublishButton}
							title={publishButtonTooltip}
							onClick={handlePublish}
							className="u-color-klascement u-m-t"
						/>
					</Column>
				</Grid>
			</>
		);
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form className="u-m-b-xl">
						{renderCreateNewMarcomEntryForm()}
						<Spacer margin={['top-extra-large', 'bottom-large']}>
							{renderExistingMarcomEntries()}
						</Spacer>
						{renderMarcomRemarksField()}
						{commonUser?.permissions?.includes(
							PermissionName.PUBLISH_ASSIGNMENT_TO_KLASCEMENT
						) && renderPublishToKlascementForm()}
					</Form>
				</Container>
			</Container>
		</>
	);
};
