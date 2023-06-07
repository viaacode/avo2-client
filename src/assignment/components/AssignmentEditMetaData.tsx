import { Column, Container, Form, Grid, Spacer } from '@viaa/avo2-components';
import { Avo, LomSchemeTypeEnum } from '@viaa/avo2-types';
import { isEmpty, isNil } from 'lodash-es';
import React, { FC, useEffect, useState } from 'react';

import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { mapLomsToLomFields } from '../../shared/components/LomFieldsInput/LomFieldsInput.helpers';
import { groupLoms } from '../../shared/helpers/lom';
import { LomFieldsByScheme } from '../../shared/types/lom';
import { Assignment_v2_With_Blocks } from '../assignment.types';

type AssignmentEditMetaDataProps = {
	assignment: Assignment_v2_With_Blocks | null;
	onChange: (lomIds: string[]) => void;
};

const AssignmentEditMetaData: FC<AssignmentEditMetaDataProps> = ({ assignment, onChange }) => {
	const [lomFields, setLomFields] = useState<LomFieldsByScheme>({
		contexts: [],
		educationLevels: [],
		subjects: [],
		themes: [],
	});

	useEffect(() => {
		if (!isNil(assignment) && !isEmpty(assignment) && !isNil(assignment.loms)) {
			console.log(assignment);
			const groupedLoms = groupLoms(assignment.loms as { lom?: Avo.Lom.LomEntry }[]);

			setLomFields({
				...lomFields,
				educationLevels:
					mapLomsToLomFields(
						groupedLoms[LomSchemeTypeEnum.structure] as Avo.Lom.LomEntry[]
					) || [],
				subjects:
					mapLomsToLomFields(
						groupedLoms[LomSchemeTypeEnum.subject] as Avo.Lom.LomEntry[]
					) || [],
				themes:
					mapLomsToLomFields(
						groupedLoms[LomSchemeTypeEnum.theme] as Avo.Lom.LomEntry[]
					) || [],
			});
		}
	}, []);

	const updateAssignmentLoms = async (selectedLomFieldOptions: Partial<LomFieldsByScheme>) => {
		const newLomFields = {
			...lomFields,
			...selectedLomFieldOptions,
		};

		setLomFields(newLomFields);

		const flatLomFields = Object.values(lomFields).flatMap((lomField) => lomField);
		onChange(flatLomFields.map((lom) => lom.id as string));
	};

	useEffect(() => {
		console.log(lomFields);
	}, [lomFields]);
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<Form>
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<LomFieldsInput {...lomFields} onChange={updateAssignmentLoms} />
							</Column>
						</Grid>
					</Spacer>
				</Form>
			</Container>
		</Container>
	);
};

export default AssignmentEditMetaData;
