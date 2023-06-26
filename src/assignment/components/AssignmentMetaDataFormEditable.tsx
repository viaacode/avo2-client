import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Image,
	Spacer,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { map } from 'lodash-es';
import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { ShortDescriptionField, ThumbnailStillsModal } from '../../shared/components';
import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import useTranslation from '../../shared/hooks/useTranslation';

type AssignmentMetaDataFormEditableProps = {
	assignment: Avo.Assignment.Assignment;
	setAssignment: Dispatch<SetStateAction<Avo.Assignment.Assignment>>;
	setValue: UseFormSetValue<Avo.Assignment.Assignment>;
};

const AssignmentMetaDataFormEditable: FC<AssignmentMetaDataFormEditableProps> = ({
	assignment,
	setAssignment,
	setValue,
}) => {
	const { tText } = useTranslation();
	const [isAssignmentStillsModalOpen, setIsAssignmentStillsModalOpen] =
		useState<boolean>(false);

	const onLomsChange = (loms: Avo.Lom.LomField[]) => {
		const mappedLoms = loms.map((lom) => ({
			id: null,
			lom_id: lom.id,
			assignment_id: assignment?.id,
			lom,
		}));

		(setValue as any)('loms', mappedLoms, {
			shouldDirty: true,
			shouldTouch: true,
		});

		setAssignment((prev) => ({
			...prev,
			loms: mappedLoms,
			blocks: (prev as Avo.Assignment.Assignment)?.blocks || [],
		}));
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<LomFieldsInput
										loms={
											(map(assignment?.loms, 'lom') as Avo.Lom.LomField[]) ||
											[]
										}
										onChange={onLomsChange}
									/>

									<ShortDescriptionField
										value={assignment?.description || ''}
										placeholder={tText(
											'assignment/components/assignment-meta-data-form-editable___beschrijf-je-opdracht-in-maximum-300-tekens-dit-is-de-tekst-die-ander-gebruikers-bij-jouw-opdracht-zien-in-de-zoekresultaten-hiermee-kunnen-ze-dan-bepalen-of-deze-beantwoord-aan-wat-ze-zoeken'
										)}
										onChange={(value: string) => {
											{
												(setValue as any)('description', value, {
													shouldDirty: true,
													shouldTouch: true,
												});
												setAssignment((prev) => ({
													...prev,
													description: value,
													blocks:
														(prev as Avo.Assignment.Assignment)
															?.blocks || [],
												}));
											}
										}}
									/>
								</Column>

								<Column size="3-5">
									<FormGroup
										label={tText('Cover afbeelding')}
										labelFor="coverImageId"
									>
										<Button
											type="secondary"
											label={tText('Stel een hoofdafbeelding in')}
											title={tText(
												'Kies een afbeelding om te gebruiken als hoofdafbeelding van deze opdracht.'
											)}
											onClick={() => setIsAssignmentsStillsModalOpen(true)}
										/>

										{assignment.thumbnail_path && (
											<Image
												className="u-spacer-top"
												src={assignment.thumbnail_path}
											/>
										)}
									</FormGroup>
								</Column>
							</Grid>
						</Spacer>
					</Form>
				</Container>
			</Container>

			<ThumbnailStillsModal
				isOpen={isAssignmentsStillsModalOpen}
				onClose={(updated) => {
					setIsAssignmentsStillsModalOpen(false);

					if (assignment.thumbnail_path !== updated.thumbnail_path) {
						(setValue as any)('thumnail_path', updated.thumbnail_path, {
							shouldDirty: true,
							shouldTouch: true,
						});
						setAssignment((prev) => ({
							...prev,
							thumbnail_path: updated.thumbnail_path,
							blocks: (prev as Avo.Assignment.Assignment)?.blocks || [],
						}));
					}
				}}
				subject={assignment}
			/>
		</>
	);
};

export default AssignmentMetaDataFormEditable;
