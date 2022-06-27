import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	Icon,
	Modal,
	ModalBody,
	ModalProps,
	Spacer,
} from '@viaa/avo2-components';
import { IconNameSchema } from '@viaa/avo2-components/dist/esm/components/Icon/Icon.types';

import { EDIT_ASSIGNMENT_BLOCK_ICONS } from '../assignment.const';
import { AssignmentBlockType, AssignmentFormState } from '../assignment.types';

import './AddBlock.scss';

type AddBlockType = AssignmentBlockType | 'COLLECTIE';

interface AddBlockProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
	assignment: AssignmentFormState;
	onConfirm?: (type: AddBlockType) => void;
}

const AddBlock: FunctionComponent<AddBlockProps> = ({ assignment, isOpen, onClose, onConfirm }) => {
	const [t] = useTranslation();

	const items: {
		type: AddBlockType;
		icon: IconNameSchema;
		title: ReactNode;
		description: ReactNode;
		disabled?: boolean;
	}[] = useMemo(
		() => [
			{
				type: AssignmentBlockType.ITEM,
				icon: EDIT_ASSIGNMENT_BLOCK_ICONS()[AssignmentBlockType.ITEM],
				title: t('assignment/modals/add-block___kijken-luisteren-fragment'),
				description: t(
					'assignment/modals/add-block___voeg-een-fragment-uit-je-werkruimte-toe-om-te-laten-bekijken-of-beluisteren'
				),
			},
			{
				type: 'COLLECTIE',
				icon: 'collection',
				title: t('assignment/modals/add-block___kijken-luisteren-collectie'),
				description: t(
					'assignment/modals/add-block___start-je-opdracht-vanaf-een-bestaande-collectie-fragmenten-uit-je-werkruimte'
				),
			},
			{
				type: AssignmentBlockType.ZOEK,
				icon: EDIT_ASSIGNMENT_BLOCK_ICONS()[AssignmentBlockType.ZOEK],
				title: t('assignment/modals/add-block___zoeken-bouwen'),
				description: t(
					'assignment/modals/add-block___leer-leerlingen-zelf-bronnen-zoeken-of-laat-ze-een-collectie-samenstellen'
				),
				disabled:
					assignment.blocks.findIndex(
						(block) => block.type === AssignmentBlockType.ZOEK
					) >= 0,
			},
			{
				type: AssignmentBlockType.TEXT,
				icon: EDIT_ASSIGNMENT_BLOCK_ICONS()[AssignmentBlockType.TEXT],
				title: t('assignment/modals/add-block___instructies-tekst'),
				description: t(
					'assignment/modals/add-block___voeg-een-tekstblok-toe-met-instructies-of-wat-extra-informatie'
				),
			},
		],
		[assignment.blocks, t]
	);

	return (
		<Modal
			isOpen={isOpen}
			title={t('assignment/modals/add-block___toevoegen')}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>
				<Spacer margin={['top-small', 'bottom-small', 'left', 'right']}>
					<ul className="c-add-block__list">
						{items.map((item) => (
							<li
								className={[
									'c-add-block__list-item',
									...(item.disabled ? ['c-add-block__list-item--disabled'] : []),
								].join(' ')}
								key={item.type}
							>
								<div className="c-add-block__icon">
									<Icon name={item.icon} />
								</div>

								<div className="c-add-block__content">
									<BlockHeading type="h4">{item.title}</BlockHeading>

									<p className="c-add-block__description">{item.description}</p>
								</div>

								<div className="c-add-block__actions">
									{!item.disabled && (
										<Button
											icon="plus"
											type="primary"
											onClick={() => {
												onConfirm && onConfirm(item.type);
											}}
										/>
									)}
								</div>
							</li>
						))}
					</ul>
				</Spacer>
			</ModalBody>
		</Modal>
	);
};

export default AddBlock;
