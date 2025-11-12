import Adapter from '@cfaester/enzyme-adapter-react-18'
import { configure } from 'enzyme'
import 'jest-expect-message'

configure({ adapter: new Adapter() })
