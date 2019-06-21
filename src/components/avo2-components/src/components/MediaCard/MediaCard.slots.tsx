import { FunctionComponent, ReactElement } from 'react';

export interface MediaCardSlotProps {
	children: ReactElement;
}

export const MediaCardThumbnail: FunctionComponent<MediaCardSlotProps> = ({
	children,
}: MediaCardSlotProps) => children;

export const MediaCardMetaData: FunctionComponent<MediaCardSlotProps> = ({
	children,
}: MediaCardSlotProps) => children;
