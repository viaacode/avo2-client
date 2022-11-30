import { BlockHeading, ContentInput, Flex, Icon } from '@viaa/avo2-components';
import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';

import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentFormState } from '../assignment.types';

type AssignmentTitleProps = {
	control?: Control<AssignmentFormState>;
	setAssignment?: Dispatch<SetStateAction<Partial<AssignmentFormState> | undefined>>;
};

const AssignmentTitle: FC<AssignmentTitleProps> = ({ control, setAssignment }) => {
	const { tText } = useTranslation();

	return useMemo(
		() => (
			<Flex center className="u-spacer-top-l">
				<Icon name="clipboard" size="large" />

				<BlockHeading className="u-spacer-left" type="h2">
					<Controller
						name="title"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<>
								<ContentInput
									{...field}
									value={field.value ?? undefined}
									placeholder={tText(
										'assignment/views/assignment-create___placeholder'
									)}
									nodeCancel={<Icon name="x" size="small" />}
									nodeSubmit={<Icon name="check" size="small" />}
									onChange={(title) => {
										field.onChange(title);
										setAssignment &&
											setAssignment((previous) => {
												return {
													...previous,
													title,
												};
											});
									}}
								/>

								{error && <span className="c-floating-error">{error.message}</span>}
							</>
						)}
					/>
				</BlockHeading>
			</Flex>
		),
		[tText, control, setAssignment]
	);
};

export default AssignmentTitle;
