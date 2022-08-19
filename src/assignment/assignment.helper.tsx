import {
	Alert,
	Container,
	DatePicker,
	Flex,
	Form,
	FormGroup,
	IconName,
	Spacer,
	TextInput,
	Toggle,
} from '@viaa/avo2-components';
import { RadioOption } from '@viaa/avo2-components/dist/esm/components/RadioButtonGroup/RadioButtonGroup';
import { Avo } from '@viaa/avo2-types';
import { AssignmentLabel_v2 } from '@viaa/avo2-types/types/assignment';
import { isNil } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { APP_PATH } from '../constants';
import { CuePoints } from '../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import Html from '../shared/components/Html/Html';
import WYSIWYGWrapper from '../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import { WYSIWYG_OPTIONS_FULL } from '../shared/constants';
import { buildLink, openLinkInNewTab } from '../shared/helpers';
import { ToastService } from '../shared/services';
import { trackEvents } from '../shared/services/event-logging-service';
import i18n from '../shared/translations/i18n';
import { Positioned } from '../shared/types';

import { AssignmentService } from './assignment.service';
import {
	AssignmentLayout,
	AssignmentRetrieveError,
	AssignmentSchemaLabel_v2,
	AssignmentType,
} from './assignment.types';
import AssignmentLabels from './components/AssignmentLabels';

export class AssignmentHelper {
	public static async attemptDuplicateAssignment(
		newTitle: string,
		assignment: Partial<Avo.Assignment.Assignment_v2>,
		user: Avo.User.User | undefined
	): Promise<void> {
		try {
			if (isNil(assignment.id)) {
				ToastService.danger(
					i18n.t(
						'assignment/assignment___je-kan-een-opdracht-pas-dupliceren-nadat-je-hem-hebt-opgeslagen'
					)
				);
				return;
			}
			if (!user) {
				ToastService.danger(
					i18n.t(
						'assignment/assignment___de-opdracht-kan-niet-gedupliceerd-worden-omdat-je-niet-meer-bent-ingelogd'
					)
				);
				return;
			}
			const duplicatedAssignment = await AssignmentService.duplicateAssignment(
				newTitle,
				assignment
			);

			trackEvents(
				{
					object: String(assignment.id),
					object_type: 'assignment',
					action: 'copy',
				},
				user
			);

			openLinkInNewTab(
				buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: duplicatedAssignment.id })
			);

			ToastService.success(
				i18n.t(
					'assignment/views/assignment-overview___het-dupliceren-van-de-opdracht-is-gelukt'
				)
			);
		} catch (err) {
			console.error('Failed to copy the assignment', err);
			ToastService.danger(
				i18n.t('assignment/views/assignment-edit___het-kopieren-van-de-opdracht-is-mislukt')
			);
		}
	}

	private static isDeadlineInThePast(assignment: Partial<Avo.Assignment.Assignment_v2>): boolean {
		return !!assignment.deadline_at && new Date(assignment.deadline_at) < new Date(Date.now());
	}

	public static getContentLayoutOptions(): RadioOption[] {
		return [
			{
				label: i18n.t('assignment/views/assignment-edit___mediaspeler-met-beschrijving'),
				value: AssignmentLayout.PlayerAndText.toString(),
			},
			{
				label: i18n.t('assignment/views/assignment-edit___enkel-mediaspeler'),
				value: AssignmentLayout.OnlyPlayer.toString(),
			},
		];
	}

	public static renderAssignmentForm(
		assignment: Partial<Avo.Assignment.Assignment_v2>,
		// assignmentContent: Avo.Assignment.Content | null,
		assignmentLabels: Avo.Assignment.Label_v2[],
		user: Avo.User.User,
		setAssignmentProp: (
			property: keyof Avo.Assignment.Assignment_v2 | 'descriptionRichEditorState',
			value: any
		) => void,
		setAssignmentLabels: (labels: AssignmentSchemaLabel_v2[]) => void
	): ReactNode {
		const now = new Date(Date.now());

		return (
			<Container mode="horizontal" size="small" className="c-assignment-create-and-edit">
				<Container mode="vertical" size="small">
					<Form>
						<FormGroup
							required
							label={i18n.t('assignment/views/assignment-edit___titel')}
						>
							<TextInput
								id="title"
								value={assignment.title}
								onChange={(title) => setAssignmentProp('title', title)}
							/>
						</FormGroup>
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___opdracht')}
							required
						>
							<WYSIWYGWrapper
								id="assignmentDescription"
								initialHtml={assignment.description}
								state={(assignment as any)['descriptionRichEditorState']}
								controls={[...WYSIWYG_OPTIONS_FULL, 'media']}
								fileType="ASSIGNMENT_DESCRIPTION_IMAGE"
								onChange={(newState) =>
									setAssignmentProp('descriptionRichEditorState', newState)
								}
								enabledHeadings={['h3', 'h4', 'normal']}
							/>
						</FormGroup>
						{/* <FormGroup label={i18n.t('assignment/views/assignment-edit___inhoud')}>
							<ContentLink
								parent={assignment}
								content={assignmentContent}
							/>
						</FormGroup>
						<FormGroup label={i18n.t('assignment/views/assignment-edit___weergave')}>
							<LayoutOptions
								item={assignment}
								onChange={(value: string) => {
									setAssignmentProp(
										'content_layout',
										value ? parseInt(value, 10) : null
									);
								}}
							/>
						</FormGroup> */}
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___klas-of-groep')}
							required
						>
							{/*<TextInput*/}
							{/*	id="class_room"*/}
							{/*	value=/!*assignment.class_room || 'TODO CLASSroom was changes'}*/}
							{/*	onChange={(classRoom) => setAssignmentProp('class_room', classRoom)}*/}
							{/*/>*/}
						</FormGroup>
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___vak-of-project')}
						>
							<AssignmentLabels
								labels={assignmentLabels.map((item) => ({
									assignment_label: item,
								}))}
								user={user}
								onChange={setAssignmentLabels}
							/>
						</FormGroup>
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___antwoorden-op')}
							labelFor="answer_url"
						>
							<TextInput
								id="answer_url"
								type="text"
								placeholder={i18n.t('assignment/views/assignment-edit___http')}
								value={assignment.answer_url || ''}
								onChange={(value) => setAssignmentProp('answer_url', value)}
							/>
							<p className="c-form-help-text">
								<Trans i18nKey="assignment/views/assignment-edit___waar-geeft-de-leerling-de-antwoorden-in-voeg-een-optionele-url-naar-een-ander-platform-toe">
									Waar geeft de leerling de antwoorden in? Voeg een optionele URL
									naar een ander platform toe.
								</Trans>
							</p>
						</FormGroup>
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___beschikbaar-vanaf')}
						>
							<Flex>
								<DatePicker
									value={
										assignment.available_at
											? new Date(assignment.available_at)
											: now
									}
									onChange={(value: Date | null) =>
										setAssignmentProp(
											'available_at',
											value ? value.toISOString() : null
										)
									}
									showTimeInput
								/>
							</Flex>
						</FormGroup>
						<FormGroup
							label={i18n.t('assignment/views/assignment-edit___deadline')}
							required
						>
							<Flex>
								<Spacer margin="right-small">
									<DatePicker
										value={
											assignment.deadline_at
												? new Date(assignment.deadline_at)
												: null
										}
										onChange={(value) =>
											setAssignmentProp('deadline_at', value)
										}
										showTimeInput
									/>
								</Spacer>
							</Flex>
							{this.isDeadlineInThePast(assignment) ? (
								<div className="c-form-help-text c-form-help-text--error">
									<Trans i18nKey="assignment/views/assignment-edit___de-deadline-ligt-in-het-verleden">
										De deadline ligt in het verleden.
									</Trans>
									<br />
									<Trans i18nKey="assignment/views/assignment-edit___de-leerlingen-zullen-dus-geen-toegang-hebben-tot-deze-opdracht">
										De leerlingen zullen dus geen toegang hebben tot deze
										opdracht
									</Trans>
								</div>
							) : (
								<p className="c-form-help-text">
									<Trans i18nKey="assignment/views/assignment-edit___na-deze-datum-kan-de-leerling-de-opdracht-niet-meer-invullen">
										Na deze datum kan de leerling de opdracht niet meer
										invullen.
									</Trans>
								</p>
							)}
						</FormGroup>
						{assignment.assignment_type === AssignmentType.BOUW && (
							<FormGroup
								label={i18n.t('assignment/views/assignment-edit___groepswerk')}
							>
								<Toggle
									checked={assignment.is_collaborative}
									onChange={(checked) =>
										setAssignmentProp('is_collaborative', checked)
									}
								/>
							</FormGroup>
						)}
						<hr className="c-hr" />
						<Alert type="info">
							<div className="c-content c-content--no-m">
								<Html
									content={i18n.t(
										'assignment/views/assignment-edit___hulp-nodig-bij-het-maken-van-opdrachten'
									)}
									sanitizePreset={'link'}
								/>
							</div>
						</Alert>
					</Form>
				</Container>
			</Container>
		);
	}

	public static getLabels(
		assignment: Avo.Assignment.Assignment_v2,
		type: string
	): { assignment_label: AssignmentLabel_v2 }[] {
		return (
			assignment?.labels?.filter((label: any) => label.assignment_label.type === type) || []
		);
	}

	public static getDisplayTitle(block: Avo.Assignment.Block): string {
		if (!block.use_custom_fields) {
			if (block.original_title || block.original_description) {
				return block.original_title || '';
			}
			return block.item_meta?.title || '';
		}
		return block.custom_title || '';
	}

	public static getDisplayDescription(block: Avo.Assignment.Block): string {
		if (!block.use_custom_fields) {
			if (block.original_title || block.original_description) {
				return block.original_description || '';
			}
			return block.item_meta?.description || '';
		}
		return block.custom_description || '';
	}

	public static getCuePoints(block: Avo.Assignment.Block): CuePoints | undefined {
		if (block.start_oc || block.end_oc) {
			return {
				start: block.start_oc,
				end: block.end_oc,
			};
		}
		return undefined;
	}

	public static getThumbnail(block: Avo.Assignment.Block): string | undefined {
		return block.thumbnail_path || undefined;
	}
}

// Zoek & bouw

export function setPositionToIndex<T>(items: Positioned<T>[]): Positioned<T>[] {
	return items.map((item, i) => {
		return {
			...item,
			position: i,
		};
	});
}

export function getAssignmentErrorObj(errorType: AssignmentRetrieveError): {
	message: string;
	icon: IconName;
} {
	switch (errorType) {
		case AssignmentRetrieveError.DELETED:
			return {
				message: i18n.t('assignment/views/assignment-detail___de-opdracht-werd-verwijderd'),
				icon: 'delete',
			};

		case AssignmentRetrieveError.NOT_YET_AVAILABLE:
			return {
				message: i18n.t(
					'assignment/views/assignment-detail___de-opdracht-is-nog-niet-beschikbaar'
				),
				icon: 'clock',
			};

		default:
			return {
				message: i18n.t(
					'assignment/views/assignment-detail___het-ophalen-van-de-opdracht-is-mislukt'
				),
				icon: 'alert-triangle',
			};
	}
}
