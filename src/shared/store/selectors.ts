import { AppState } from '../../store';

const selectIsModalOpen = ({ globalState }: AppState) => {
	return globalState.isModalOpen;
};

export { selectIsModalOpen };
