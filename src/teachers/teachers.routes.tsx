import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { TEACHERS_PATH } from './teachers.const';
import { ForTeachers } from './views';

export const renderTeacherRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={ForTeachers}
		exact
		path={TEACHERS_PATH.FOR_TEACHERS}
		key={TEACHERS_PATH.FOR_TEACHERS}
	/>,
];
