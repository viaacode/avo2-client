import { get } from 'lodash-es';

import { AppState } from '../../store';
import { MenuItem } from '../admin.types';

export const selectMenuItems = ({ menu }: AppState): MenuItem[] => get(menu, 'menuItems', []);
