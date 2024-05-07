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
import React, { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { EducationLevelId } from '../../helpers/lom';
import { tHtml, tText } from '../../helpers/translate';
import withUser, { type UserProps } from '../../hocs/withUser';
import { useLomEducationLevels } from '../../hooks/useLomEducationLevels';

type SelectEducationLevelModalProps = Omit<ModalProps, 'children'> &
	Partial<UserProps> & {
		onConfirm?: (lom: Avo.Lom.LomField) => void;
	};

// Component

const SelectEducationLevelModal: FunctionComponent<SelectEducationLevelModalProps> = (props) => {
	const { user, commonUser, onConfirm, ...modal } = props;

	const [educationLevels] = useLomEducationLevels();
	const [selected, setSelected] = useState<Avo.Lom.LomField | undefined>(undefined);

	const rendered = useMemo(
		() => [EducationLevelId.lagerOnderwijs, EducationLevelId.secundairOnderwijs].map(String),
		[]
	);

	const options = useMemo(
		() =>
			educationLevels
				.filter((level) => rendered.includes(level.id))
				.map(
					(lom) =>
						({
							label: lom?.label,
							value: lom?.id,
						}) as { label: string; value: string }
				),
		[educationLevels, rendered]
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
		<Modal title={tHtml('Kies je onderwijsniveau')} size="medium" scrollable {...modal}>
			<ModalBody>
				<section className="u-spacer-bottom">
					{tHtml('Waarom is het belangrijk dat je een onderwijsniveau kiest?')}
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
