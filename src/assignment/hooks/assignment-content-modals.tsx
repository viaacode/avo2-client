import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { UseFormSetValue } from 'react-hook-form';
import { SingleEntityModal, useSingleEntityModal } from '../../shared/hooks';
import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../assignment.const';
import { AssignmentBlockType, AssignmentFormState } from '../assignment.types';
import { insertAtPosition } from '../helpers/insert-at-position';
import AddBlockModal, { AddBlockModalProps } from '../modals/AddBlockModal';
import ConfirmSliceModal, { ConfirmSliceModalProps } from '../modals/ConfirmSliceModal';

export function useAssignmentContentModals(
    assignment: AssignmentFormState,
    setAssignment: React.Dispatch<React.SetStateAction<AssignmentFormState>>,
    setValue: UseFormSetValue<AssignmentFormState>,
    config?: {
        confirmSliceConfig?: Partial<ConfirmSliceModalProps>,
        addBlockConfig?: Partial<AddBlockModalProps>
    }
): [
	JSX.Element,
	SingleEntityModal<Pick<AssignmentBlock, 'id'>>,
	SingleEntityModal<number>
] {
	const slice = useSingleEntityModal<Pick<AssignmentBlock, 'id'>>();
	const {
		isOpen: isConfirmSliceModalOpen,
		setOpen: setConfirmSliceModalOpen,
		entity: getConfirmSliceModalBlock,
	} = slice;

	const block = useSingleEntityModal<number>();
	const {
		isOpen: isAddBlockModalOpen,
		setOpen: setAddBlockModalOpen,
		entity: getAddBlockModalPosition,
	} = block;

	const ui = (
		<>
			<ConfirmSliceModal
                {...config?.confirmSliceConfig}
				isOpen={!!isConfirmSliceModalOpen}
				block={getConfirmSliceModalBlock as AssignmentBlock}
				onClose={() => setConfirmSliceModalOpen(false)}
				onConfirm={() => {
					const blocks = assignment.blocks.filter(
						(item) => item.id !== getConfirmSliceModalBlock?.id
					);

					setAssignment((prev) => ({
						...prev,
						blocks,
					}));

					setValue('blocks', blocks, { shouldDirty: true, shouldTouch: true });
					setConfirmSliceModalOpen(false);
				}}
			/>

			{assignment && (
				<AddBlockModal
                    {...config?.addBlockConfig}
					isOpen={!!isAddBlockModalOpen}
					assignment={assignment}
					onClose={() => setAddBlockModalOpen(false)}
					onConfirm={(type) => {
						if (getAddBlockModalPosition === undefined) {
							return;
						}

						switch (type) {
							case AssignmentBlockType.TEXT:
							case AssignmentBlockType.ZOEK:
								const blocks = insertAtPosition(assignment.blocks, {
									id: `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}${new Date().valueOf()}`,
									type,
									position: getAddBlockModalPosition,
								} as AssignmentBlock); // TODO: avoid cast

								setAssignment((prev) => ({
									...prev,
									blocks,
								}));

								setValue('blocks', blocks, {
									shouldDirty: true,
									shouldTouch: true,
								});
								break;

							default:
								break;
						}

						setAddBlockModalOpen(false);
					}}
				/>
			)}
		</>
	);

	return [ui, slice, block];
}
