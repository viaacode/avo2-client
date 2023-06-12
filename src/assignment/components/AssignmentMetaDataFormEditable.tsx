import { Column, Container, Form, Grid, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { map } from 'lodash-es';
import React, { Dispatch, FC, SetStateAction } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { ShortDescriptionField } from '../../shared/components';
import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	Assignment_v2_With_Blocks,
	Assignment_v2_With_Labels,
	AssignmentFormState,
} from '../assignment.types';

type AssignmentMetaDataFormEditableProps = {
	assignment: Assignment_v2_With_Labels & Assignment_v2_With_Blocks;
	setAssignment: Dispatch<SetStateAction<Assignment_v2_With_Labels & Assignment_v2_With_Blocks>>;
	setValue: UseFormSetValue<AssignmentFormState>;
};

const AssignmentMetaDataFormEditable: FC<AssignmentMetaDataFormEditableProps> = ({
	assignment,
	setAssignment,
	setValue,
}) => {
	const { tText } = useTranslation();

	const onLomsChange = (loms: Avo.Lom.LomField[]) => {
		const mappedLoms = loms.map((lom) => ({
			id: null,
			lom_id: lom.id,
			assignment_id: assignment?.id,
			lom,
		}));

		setValue('loms', mappedLoms, {
			shouldDirty: true,
			shouldTouch: true,
		});

		setAssignment((prev) => ({
			...prev,
			loms: mappedLoms,
			blocks: (prev as Assignment_v2_With_Blocks)?.blocks || [],
		}));
	};

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<Form>
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<LomFieldsInput
									loms={
										(map(assignment?.loms, 'lom') as Avo.Lom.LomField[]) || []
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
											setValue('description', value, {
												shouldDirty: true,
												shouldTouch: true,
											});
											setAssignment({
												...assignment,
												description: value,
											});
										}
									}}
								/>
							</Column>
						</Grid>
					</Spacer>
				</Form>
			</Container>
		</Container>
	);
};

export default AssignmentMetaDataFormEditable;
