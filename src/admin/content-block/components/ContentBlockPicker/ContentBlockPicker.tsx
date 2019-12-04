import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import Select from 'react-select';

interface ContentBlockPickerProps {
	className?: string;
}

const ContentBlockPicker: FunctionComponent<ContentBlockPickerProps> = ({ className }) => {
	return <Select className={classnames(className, 'c-content-block-picker')} isSearchable />;
};

export default ContentBlockPicker;
