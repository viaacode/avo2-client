import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-expect-message';
import $ from 'jquery';
(global as any).$ = (global as any).jQuery = $;

configure({ adapter: new Adapter() });
