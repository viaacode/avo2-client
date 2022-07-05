import { BlockHeading, ContentInput, Flex, Icon } from '@viaa/avo2-components';
import React, { FC, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AssignmentFormState } from '../assignment.types';

type AssignmentTitleProps = {
	control?: Control<AssignmentFormState, object>;
	setAssignment?: React.Dispatch<React.SetStateAction<AssignmentFormState>>;
};

const AssignmentTitle: FC<AssignmentTitleProps> = ({ control, setAssignment }) => {
	const [t] = useTranslation();

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
									placeholder={t(
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
					></Controller>
				</BlockHeading>
			</Flex>
		),
		[t, control, setAssignment]
	);
};

export default AssignmentTitle;
