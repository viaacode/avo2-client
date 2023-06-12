import { Form, FormGroup, Spacer, TagsInput } from '@viaa/avo2-components';
import { TagInfoSchema } from '@viaa/avo2-components/dist/esm/components/TagsInput/TagsInput';
import { Avo } from '@viaa/avo2-types';
import { filter, isNil, map, uniq } from 'lodash-es';
import React, { FC, useMemo } from 'react';

import { groupLoms } from '../../helpers/lom';
import { useGetLomEducationLevels } from '../../hooks/useGetLomEducationLevels';
import { useGetLomSubjects } from '../../hooks/useGetLomSubjects';
import { useGetLomThemes } from '../../hooks/useGetLomThemes';
import useTranslation from '../../hooks/useTranslation';
import { LomSchemeType } from '../../types/lom';

import {
	getParentContext,
	mapLomFieldsToOptions,
	mapOptionsToLomFields,
} from './LomFieldsInput.helpers';

type LomFieldsInputProps = {
	loms: Avo.Lom.Lom[];
	onChange: (newLoms: Avo.Lom.LomField[]) => void;
};

const LomFieldsInput: FC<LomFieldsInputProps> = ({ loms, onChange }) => {
	const { tText } = useTranslation();

	const lomFields = useMemo(() => {
		return groupLoms(loms as { lom?: Avo.Lom.LomField }[]);
	}, [loms]);
	const { data: allEducationLevels, isLoading: isEducationLevelsLoading } =
		useGetLomEducationLevels();
	const { data: allSubjects, isLoading: isSubjectsLoading } = useGetLomSubjects(
		map(lomFields.educationLevels, 'id')
	);
	const { data: allThemes, isLoading: isThemesLoading } = useGetLomThemes(
		map([...lomFields.educationLevels, ...lomFields.subjects], 'id')
	);

	const handleChange = (
		values: TagInfoSchema[],
		scheme: LomSchemeType,
		allSchemeLoms: Avo.Lom.LomField[]
	) => {
		const mappedLoms = mapOptionsToLomFields(values, allSchemeLoms);
		const newLoms = { ...lomFields, [scheme]: mappedLoms };
		let flatLomList: Avo.Lom.LomField[];
		flatLomList = Object.values(newLoms).flat();

		if (scheme === 'educationLevels') {
			const parentContexts = getParentContext(mappedLoms, allEducationLevels || []);

			flatLomList = [...flatLomList, ...parentContexts];
		}

		onChange(uniq(flatLomList));
	};

	const filterAllEduLevels = (loms: Avo.Lom.LomField[]) => {
		return filter(loms, (lom) => !isNil(lom?.broader));
	};

	return (
		<Form>
			<Spacer margin="bottom">
				<FormGroup
					label={tText(
						'shared/components/lom-fields-input/lom-fields-input___onderwijsniveau'
					)}
					labelFor="classificationId"
				>
					<TagsInput
						isLoading={isEducationLevelsLoading}
						options={mapLomFieldsToOptions(
							filterAllEduLevels(allEducationLevels || [])
						)}
						value={mapLomFieldsToOptions(lomFields.educationLevels) || []}
						onChange={(values) =>
							handleChange(values, 'educationLevels', allEducationLevels || [])
						}
					/>
				</FormGroup>

				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___vakken')}
					labelFor="subjectId"
				>
					<TagsInput
						isLoading={isSubjectsLoading}
						options={mapLomFieldsToOptions(allSubjects || [])}
						value={mapLomFieldsToOptions(lomFields.subjects) || []}
						onChange={(values) => handleChange(values, 'subjects', allSubjects || [])}
					/>
				</FormGroup>

				<FormGroup
					label={tText('shared/components/lom-fields-input/lom-fields-input___themas')}
					labelFor="themeId"
				>
					<TagsInput
						isLoading={isThemesLoading}
						options={mapLomFieldsToOptions(allThemes || [])}
						value={mapLomFieldsToOptions(lomFields.themes) || []}
						onChange={(values) => handleChange(values, 'themes', allThemes || [])}
					/>
				</FormGroup>
			</Spacer>
		</Form>
	);
};

export default LomFieldsInput;
