import {
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TagInfo,
	TagsInput,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { PermissionName } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';
import React, { Dispatch, FC, SetStateAction } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { PickerItem } from '../../admin/shared/types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { QualityLabel } from '../../collection/collection.types';
import { formatTimestamp, getFullName } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { useGetQualityLabels } from '../../shared/hooks';
import useTranslation from '../../shared/hooks/useTranslation';

interface AssignmentAdminFormEditableProps {
	assignment: Avo.Assignment.Assignment;
	setAssignment: Dispatch<SetStateAction<Avo.Assignment.Assignment>>;
	setValue: UseFormSetValue<Avo.Assignment.Assignment>;
}

const AssignmentAdminFormEditable: FC<AssignmentAdminFormEditableProps & UserProps> = ({
	assignment,
	user,
	setAssignment,
	setValue,
}) => {
	const { tText } = useTranslation();
	const { data: allQualityLabels, isLoading } = useGetQualityLabels();
	const owner: PickerItem | undefined = assignment.profile
		? {
				label: `${assignment.profile.user.first_name} ${assignment.profile.user.last_name} (${assignment.profile.user.mail})`,
				type: 'PROFILE',
				value: assignment.profile.id,
		  }
		: undefined;

	const transformQualityLabelsToTagInfo = (labels: QualityLabel[]): TagInfo[] => {
		return labels.map((label: QualityLabel) => ({
			label: label.description,
			value: label.value,
		}));
	};

	const getSelectedQualityLabels = (): TagInfo[] => {
		if (!allQualityLabels) {
			return [];
		}
		const labelIds = ((assignment.quality_labels || []) as Avo.Assignment.QualityLabel[]).map(
			(item: any) => item.label
		);
		const filteredQualityLabels = allQualityLabels.filter((qualityLabel) =>
			labelIds.includes(qualityLabel.value)
		);

		return transformQualityLabelsToTagInfo(filteredQualityLabels);
	};

	const handleQualityLabelChange = (labels: TagInfo[]) => {
		const newQualityLabels = labels.map(
			(label) =>
				({
					assignment_id: assignment.id,
					label: label.value,
				} as Avo.Assignment.QualityLabel)
		);

		(setValue as any)('quality_labels', newQualityLabels, {
			shouldDirty: true,
			shouldTouch: true,
		});
		setAssignment((prev) => ({
			...prev,
			quality_labels: newQualityLabels,
			blocks: (prev as Avo.Assignment.Assignment)?.blocks || [],
		}));
	};

	const handleOwnerChange = (newOwner: PickerItem | null) => {
		if (isNil(newOwner)) {
			return;
		}
		(setValue as any)('owner_profile_id', newOwner, {
			shouldDirty: true,
			shouldTouch: true,
		});
		setAssignment((prev) => ({
			...prev,
			owner_profile_id: newOwner.value,
			blocks: (prev as Avo.Assignment.Assignment)?.blocks || [],
		}));
	};

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<Form>
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<FormGroup
									label={tText(
										'assignment/components/assignment-admin-form-editable___laatst-bewerkt-door'
									)}
								>
									<TextInput
										disabled
										value={
											getFullName(assignment.updated_by, true, false) || '-'
										}
									/>
								</FormGroup>

								<FormGroup
									label={tText(
										'assignment/components/assignment-admin-form-editable___aangepast-op'
									)}
								>
									<TextInput
										disabled
										value={formatTimestamp(assignment.updated_at) || '-'}
									/>
								</FormGroup>

								{PermissionService.hasPerm(
									user,
									PermissionName.EDIT_ASSIGNMENT_QUALITY_LABELS
								) && (
									<FormGroup
										label={tText(
											'assignment/components/assignment-admin-form-editable___kwaliteitslabels'
										)}
									>
										{!!allQualityLabels && (
											<TagsInput
												isLoading={isLoading}
												options={
													transformQualityLabelsToTagInfo(
														allQualityLabels
													) || []
												}
												value={getSelectedQualityLabels()}
												onChange={handleQualityLabelChange}
											/>
										)}
									</FormGroup>
								)}

								{PermissionService.hasPerm(
									user,
									PermissionName.EDIT_ASSIGNMENT_AUTHOR
								) && (
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-admin___eigenaar'
										)}
										required
									>
										<ContentPicker
											initialValue={owner}
											hideTargetSwitch
											hideTypeDropdown
											allowedTypes={['PROFILE']}
											onSelect={handleOwnerChange}
										/>
									</FormGroup>
								)}
							</Column>
						</Grid>
					</Spacer>
				</Form>
			</Container>
		</Container>
	);
};

export default withUser(AssignmentAdminFormEditable) as FC<AssignmentAdminFormEditableProps>;
