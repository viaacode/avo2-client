import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { ContentInput, Flex, Icon, IconName } from '@viaa/avo2-components';
import React, { type FC, useMemo, useState } from 'react';
import { type Control, Controller } from 'react-hook-form';

import useTranslation from '../../shared/hooks/useTranslation';
import { MAX_TITLE_LENGTH } from '../assignment.const';
import { type AssignmentFields } from '../hooks/assignment-form';

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
	onFocus?: () => void;
};

const AssignmentTitle: FC<AssignmentTitleProps> = ({ control, setAssignment, onFocus }) => {
	const { tText } = useTranslation();
	const [isActive, setIsActive] = useState<boolean>(false);

	return useMemo(
		() => (
			<Flex center className="c-inline-title-edit">
				<BlockHeading type="h2">
					<Controller
						name="title"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<>
								<Flex align="start">
									<ContentInput
										{...field}
										value={field.value ?? undefined}
										placeholder={tText(
											'assignment/views/assignment-create___placeholder'
										)}
										nodeCancel={<Icon name={IconName.x} size="small" />}
										nodeSubmit={<Icon name={IconName.check} size="small" />}
										onConfirm={(title) =>
											setAssignment?.((previous) => {
												return {
													...previous,
													title: title as string,
												};
											})
										}
										onCancel={() => {
											setIsActive(false);
											setAssignment &&
												setAssignment((previous) => {
													return { ...previous };
												});
										}}
										onOpen={() => setIsActive(true)}
										onClose={() => {
											setIsActive(false);
											// setAssignment && setAssignment((previous) => previous);
										}}
										onFocus={onFocus}
										iconEnd={() =>
											!isActive && (
												<Icon name={IconName.edit4} size="small" subtle />
											)
										}
										maxLength={MAX_TITLE_LENGTH}
									/>
								</Flex>
								{error && (
									<div className="c-inline-title-edit__error">
										<span className="u-text-danger">{error.message}</span>
									</div>
								)}
							</>
						)}
					/>
				</BlockHeading>
			</Flex>
		),
		[tText, control, setAssignment, isActive]
	);
};

export default AssignmentTitle;
