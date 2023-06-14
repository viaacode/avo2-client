import { BlockHeading } from '@meemoo/admin-core-ui';
import { ContentInput, Flex, Icon, IconName } from '@viaa/avo2-components';
import React, { FC, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';

import useTranslation from '../../shared/hooks/useTranslation';
import { AssignmentFields } from '../hooks/assignment-form';

type AssignmentTitleProps = {
	control?: Control<any>;
	setAssignment?: (
		newAssignmentOrPreviousHandler:
			| Partial<AssignmentFields>
			| undefined
			| ((
					previous: Partial<AssignmentFields> | undefined
			  ) => Partial<AssignmentFields> | undefined)
	) => void;
};

const AssignmentTitle: FC<AssignmentTitleProps> = ({ control, setAssignment }) => {
	const { tText } = useTranslation();

	return useMemo(
		() => (
			<Flex center className="u-spacer-top-l">
				<Icon name={IconName.clipboard} size="large" />

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
									nodeCancel={<Icon name={IconName.x} size="small" />}
									nodeSubmit={<Icon name={IconName.check} size="small" />}
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
