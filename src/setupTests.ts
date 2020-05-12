import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-expect-message';

configure({ adapter: new Adapter() });
