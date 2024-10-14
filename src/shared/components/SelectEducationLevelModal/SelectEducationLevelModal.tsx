import './SelectEducationLevelModal.scss';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	type ModalProps,
	Select,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useCallback, useMemo, useState } from 'react';

import { EducationLevelId } from '../../helpers/lom';
import { tHtml, tText } from '../../helpers/translate';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useLomEducationLevelsAndDegrees } from '../../hooks/useLomEducationLevelsAndDegrees';

type SelectEducationLevelModalProps = Omit<ModalProps, 'children'> &
	Partial<UserProps> & {
		onConfirm?: (lom: Avo.Lom.LomField) => void;
	};

// Component

const SelectEducationLevelModal: FC<SelectEducationLevelModalProps> = ({ onConfirm, ...modal }) => {
	const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();
	const [selected, setSelected] = useState<Avo.Lom.LomField | undefined>(undefined);

	const rendered = useMemo(
		() => [EducationLevelId.lagerOnderwijs, EducationLevelId.secundairOnderwijs].map(String),
		[]
	);

	const options = useMemo(
		() =>
			(educationLevelsAndDegrees || [])
				.filter((level) => rendered.includes(level.id))
				.map(
					(lom) =>
						({
							label: lom?.label,
							value: lom?.id,
						}) as { label: string; value: string }
				),
		[educationLevelsAndDegrees, rendered]
	);

	const handleEducationLevelChange = useCallback(
		(input: string) => {
			const level = (educationLevelsAndDegrees || []).find(({ id }) => id === input);
			setSelected(level);
		},
		[educationLevelsAndDegrees, setSelected]
	);

	const handleConfirm = useCallback(() => {
		selected && onConfirm?.(selected);
	}, [selected, onConfirm]);

	return (
		<Modal
			title={tHtml(
				'shared/components/select-education-level-modal/select-education-level-modal___kies-je-onderwijsniveau'
			)}
			size="medium"
			scrollable
			{...modal}
		>
			<ModalBody>
				<section className="u-spacer-bottom">
					{tHtml(
						'shared/components/select-education-level-modal/select-education-level-modal___waarom-is-het-belangrijk-dat-je-een-onderwijsniveau-kiest'
					)}
				</section>

				<section className="u-spacer-bottom">
					<Select
						value={selected?.id}
						placeholder={tText(
							'shared/components/select-education-level-modal/select-education-level-modal___kies-onderwijsniveau'
						)}
						onChange={handleEducationLevelChange}
						options={options}
					/>
				</section>

				<Toolbar>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button
									type="primary"
									label={tText(
										'shared/components/select-education-level-modal/select-education-level-modal___volgende'
									)}
									disabled={!selected}
									onClick={handleConfirm}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default withUser(SelectEducationLevelModal) as FC<SelectEducationLevelModalProps>;
