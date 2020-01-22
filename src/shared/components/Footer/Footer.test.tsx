import { shallow } from 'enzyme';
import React from 'react';

import mockUser from '../../mocks/user-mock';

import { Footer } from './Footer';

describe('<Footer />', () => {
	it('Should be able to render', () => {
		shallow(<Footer user={mockUser} history={{} as any} match={{} as any} location={{} as any} />);
	});
});
