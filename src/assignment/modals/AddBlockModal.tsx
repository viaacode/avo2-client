import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
	Button,
	Icon,
	IconName,
	Modal,
	ModalBody,
	type ModalProps,
	Spacer,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import React, { type FC, type ReactNode, useMemo } from 'react';

import {
	BLOCK_TYPE_TO_ICON_NAME,
	BlockType,
} from '../../shared/components/BlockList/BlockIconWrapper/BlockIconWrapper.consts';
import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentBlockType } from '../assignment.types';

import './AddBlockModal.scss';

type AddBlockModalType =
	| AssignmentBlockType.ITEM
	| 'COLLECTIE'
	| AssignmentBlockType.ZOEK
	| AssignmentBlockType.TEXT;

interface AddBlockModalOption {
	type: AddBlockModalType;
	icon: IconName;
	title: ReactNode;
	description: ReactNode;
	disabled?: boolean;
}

export interface AddBlockModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
	blocks: Avo.Core.BlockItemBase[];
	onConfirm?: (type: AddBlockModalType) => void;
}

const AddBlockModal: FC<AddBlockModalProps> = ({ blocks, isOpen, onClose, onConfirm }) => {
	const { tHtml } = useTranslation();

	const disableSearchBlock = !!blocks.find(
		(block) =>
			block.type === AssignmentBlockType.ZOEK || block.type === AssignmentBlockType.BOUW
	);
	const items: AddBlockModalOption[] = useMemo(
		() => [
			{
				type: AssignmentBlockType.ITEM,
				icon: BLOCK_TYPE_TO_ICON_NAME[BlockType.VIDEO],
				title: tHtml('assignment/modals/add-block___kijken-luisteren-fragment'),
				description: tHtml(
					'assignment/modals/add-block___voeg-een-fragment-uit-je-werkruimte-toe-om-te-laten-bekijken-of-beluisteren'
				),
			},
			{
				type: 'COLLECTIE',
				icon: IconName.collection,
				title: tHtml('assignment/modals/add-block___kijken-luisteren-collectie'),
				description: tHtml(
					'assignment/modals/add-block___start-je-opdracht-vanaf-een-bestaande-collectie-fragmenten-uit-je-werkruimte'
				),
			},
			{
				type: AssignmentBlockType.ZOEK as AddBlockModalType,
				icon: BLOCK_TYPE_TO_ICON_NAME[BlockType.ZOEK],
				title: tHtml('assignment/modals/add-block___zoeken-bouwen'),
				description: disableSearchBlock
					? tHtml(
							'assignment/modals/add-block-modal___het-is-niet-mogelijk-om-meer-dan-een-zoekoefening-per-opdracht-te-gebruiken'
					  )
					: tHtml(
							'assignment/modals/add-block___leer-leerlingen-zelf-bronnen-zoeken-of-laat-ze-een-collectie-samenstellen'
					  ),
				disabled: disableSearchBlock,
			},
			{
				type: AssignmentBlockType.TEXT,
				icon: BLOCK_TYPE_TO_ICON_NAME[BlockType.TEXT],
				title: tHtml('assignment/modals/add-block___instructies-tekst'),
				description: tHtml(
					'assignment/modals/add-block___voeg-een-tekstblok-toe-met-instructies-of-wat-extra-informatie'
				),
			},
		],
		[disableSearchBlock, tHtml]
	);

	return (
		<Modal
			isOpen={isOpen}
			title={tHtml('assignment/modals/add-block___toevoegen')}
			size="large"
			onClose={onClose}
			scrollable
			className="c-content"
		>
			<ModalBody>
				<Spacer margin={['top-small', 'bottom-small', 'left', 'right']}>
					<ul className="c-add-block__list">
						{items.map((item) => (
							<li key={item.type}>
								<label
									htmlFor={`c-add-block__${item.type}-button`}
									className={clsx({
										'c-add-block__list-item': true,
										'c-add-block__list-item--disabled': item.disabled,
									})}
								>
									<div className="c-add-block__icon">
										<Icon name={item.icon} />
									</div>

									<div className="c-add-block__content">
										<BlockHeading type="h4">{item.title}</BlockHeading>

										<p className="c-add-block__description">
											{item.description}
										</p>
									</div>

									<div className="c-add-block__actions">
										{!item.disabled && (
											<Button
												id={`c-add-block__${item.type}-button`}
												icon={IconName.plus}
												type="primary"
												onClick={() => {
													onConfirm && onConfirm(item.type);
												}}
											/>
										)}
									</div>
								</label>
							</li>
						))}
					</ul>
				</Spacer>
			</ModalBody>
		</Modal>
	);
};

export default AddBlockModal;
