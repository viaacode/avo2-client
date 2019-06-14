import { FunctionComponent, ReactElement } from 'react';

export interface ToolbarSlotProps {
	children: ReactElement;
}

export const ToolbarLeft: FunctionComponent<ToolbarSlotProps> = ({ children }: ToolbarSlotProps) =>
	children;

export const ToolbarCenter: FunctionComponent<ToolbarSlotProps> = ({
	children,
}: ToolbarSlotProps) => children;

export const ToolbarRight: FunctionComponent<ToolbarSlotProps> = ({ children }: ToolbarSlotProps) =>
	children;
