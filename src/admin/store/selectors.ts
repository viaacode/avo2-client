import { get } from 'lodash-es';

import { AppState } from '../../store';
import { MenuItem } from '../types';

export const selectMenuItems = ({ menu }: AppState): MenuItem[] => get(menu, 'menuItems', []);
