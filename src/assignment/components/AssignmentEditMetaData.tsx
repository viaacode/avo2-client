import { Column, Container, Form, Grid, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { map } from 'lodash-es';
import React, { FC } from 'react';

import LomFieldsInput from '../../shared/components/LomFieldsInput/LomFieldsInput';
import { Assignment_v2_With_Blocks } from '../assignment.types';

type AssignmentEditMetaDataProps = {
	assignment: Assignment_v2_With_Blocks | null;
	onChange: (lomIds: Avo.Lom.LomField[]) => void;
};

const AssignmentEditMetaData: FC<AssignmentEditMetaDataProps> = ({ assignment, onChange }) => {
	const updateAssignmentLoms = async (loms: Avo.Lom.LomField[]) => {
		onChange(loms);
	};

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<Form>
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								{assignment?.loms && (
									<LomFieldsInput
										loms={map(assignment.loms, 'loms') as Avo.Lom.LomField[]}
										onChange={updateAssignmentLoms}
									/>
								)}
							</Column>
						</Grid>
					</Spacer>
				</Form>
			</Container>
		</Container>
	);
};

export default AssignmentEditMetaData;
