import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { FormControl } from '@meemoo/react-components';
import { ContentInput, Flex, Icon, IconName } from '@viaa/avo2-components';
import React, { type FC, useState } from 'react';

import { useTranslation } from '../../shared/hooks/useTranslation';
import { MAX_TITLE_LENGTH } from '../assignment.const';

type AssignmentTitleProps = {
	value: string;
	error: string | null;
	onChange: (newTitle: string) => void;
	onFocus?: () => void;
};

export const AssignmentTitle: FC<AssignmentTitleProps> = ({ error, value, onChange, onFocus }) => {
	const { tText } = useTranslation();
	const [isActive, setIsActive] = useState<boolean>(false);
	const [titleTemp, setTitleTemp] = useState(value);

	return (
		<Flex center className="c-inline-title-edit">
			<BlockHeading type="h2">
				<FormControl errors={[error]}>
					<Flex align="start">
						<ContentInput
							value={titleTemp}
							placeholder={tText('assignment/views/assignment-create___placeholder')}
							nodeCancel={<Icon name={IconName.x} size="small" />}
							nodeSubmit={<Icon name={IconName.check} size="small" />}
							onChange={(newTitle) => {
								setTitleTemp(newTitle);
							}}
							onConfirm={() => {
								onChange(titleTemp);
							}}
							onCancel={() => {
								setIsActive(false);
								setTitleTemp(value);
							}}
							onOpen={() => setIsActive(true)}
							onClose={() => {
								setIsActive(false);
							}}
							onFocus={onFocus}
							iconEnd={() =>
								!isActive && <Icon name={IconName.edit4} size="small" subtle />
							}
							maxLength={MAX_TITLE_LENGTH}
						/>
					</Flex>
				</FormControl>
			</BlockHeading>
		</Flex>
	);
};
