import { Icon, IconName } from '@viaa/avo2-components';
import React, { FC, useEffect, useState } from 'react';
import { components, GroupHeadingProps } from 'react-select';

const MultiThemeSelectOptionGroupHeading: FC<GroupHeadingProps> = (props) => {
	const { GroupHeading } = components;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [element, setElement] = useState<Element | null>();
	const handleHeaderClick = () => {
		if (!isOpen) {
			element?.classList?.remove('collapsed');
		} else {
			element?.classList?.add('collapsed');
		}

		setIsOpen(!isOpen);
	};

	useEffect(() => {
		const element = document.querySelector(`#${props.id}`)?.parentElement?.nextElementSibling;
		setElement(element);
		element?.classList.add('collapsed');
	}, []);

	return (
		<div onClick={() => handleHeaderClick()}>
			<GroupHeading {...props} className="c-multi-theme-select__group-heading">
				<Icon name={isOpen ? IconName.chevronUp : IconName.chevronDown} />
				<p>{props.data.label}</p>
			</GroupHeading>
		</div>
	);
};

export default MultiThemeSelectOptionGroupHeading;
