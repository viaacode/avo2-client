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
import { type LomFieldSchema } from '@viaa/avo2-types/types/lom';
import React, { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { EducationLevelId } from '../../helpers/lom';
import { tHtml, tText } from '../../helpers/translate';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useLomEducationLevels } from '../../hooks/useLomEducationLevels';

type SelectEducationLevelModalProps = Omit<ModalProps, 'children'> &
	Partial<UserProps> & {
		onConfirm?: (lom: LomFieldSchema) => void;
	};

// Component

const SelectEducationLevelModal: FunctionComponent<SelectEducationLevelModalProps> = (props) => {
	const { user, commonUser, onConfirm, ...modal } = props;

	const [educationLevels] = useLomEducationLevels();
	const [selected, setSelected] = useState<LomFieldSchema | undefined>(undefined);

	const options = useMemo(
		() =>
			[EducationLevelId.lagerOnderwijs, EducationLevelId.secundairOnderwijs]
				.map((level) => educationLevels.find((item) => item.id === level))
				.map(
					(lom) =>
						({
							label: lom?.label,
							value: lom?.id,
						}) as { label: string; value: string }
				),
		[educationLevels]
	);

	const handleEducationLevelChange = useCallback(
		(input: string) => {
			const level = educationLevels.find(({ id }) => id === input);
			setSelected(level);
		},
		[educationLevels, setSelected]
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
						placeholder={tText('Kies onderwijsniveau...')}
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
									label={tText('Volgende')}
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

export default withUser(
	SelectEducationLevelModal
) as FunctionComponent<SelectEducationLevelModalProps>;
