/*
 * combines all th existing reducers
 */
import * as loadingReducer from './loadingReducer';
import * as loginReducer from './loginReducer';
import * as themeReducer from './themeReducer';
import * as SettingsReducer from './SettingsReducer';
import * as CartReducer from '../../screens/Cart/reducer';
import * as memberAuth  from "../../screens/Auth/reducer";
export default Object.assign(
	loginReducer,
	loadingReducer,
	themeReducer,
	SettingsReducer,
	CartReducer,
	memberAuth,
);
