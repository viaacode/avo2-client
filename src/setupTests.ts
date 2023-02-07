import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';
import 'jest-expect-message';

configure({ adapter: new Adapter() });
