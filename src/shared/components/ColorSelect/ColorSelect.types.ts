import {type Props} from 'react-select';

export interface ColorOption {
	label: string;
	value: string;
	color?: string; // Defaults to value for the hex color code
}

export interface ColorSelectProps extends Props {
	id?: string;
	options: ColorOption[];
}
