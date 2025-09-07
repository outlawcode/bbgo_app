import * as React from "react";
import {createNavigationContainerRef, NavigationContainer} from "@react-navigation/native";
import { StatusBar } from "react-native";
import { RootStackScreen } from "app/navigation/StackScreen/RootStackScreen";
import DrawerScreen from "app/navigation/StackScreen/Drawer";
import { navigationRef } from './RootNavigation';
import linking from "app/navigation/linking";

const useNavigationWhenReady = (isReady, navigationRef) => {

	const [routeName, setRouteName] = React.useState();
	const [routeParams, setRouteParams] = React.useState({});
	const [navigationAction, setNavigationAction] = React.useState("navigate");

	React.useEffect(() => {
		if (isReady && routeName) {
			if(navigationRef && navigationRef[navigationAction]) {
				const _navigationAction = navigationRef[navigationAction];
				_navigationAction(routeName, routeParams);
			}
		}
	}, [isReady, routeParams, routeParams]);


	const navigate = (_routeName, _routeParams = {}) => {
		if(!routeName) {
			setNavigationAction("navigate");
			setRouteParams(_routeParams);
			setRouteName(_routeName);
		}
	};

	const reset = (state) => {
		if(!routeName) {
			setNavigationAction("reset");
			setRouteName(state);
		}
	};

	return { navigate, reset }
};

const App = (props) => {
	const { theme } = props;

	const [isReady, setReady] = React.useState(false);
	const navigationRef = createNavigationContainerRef();

	return (
		<NavigationContainer theme={theme} ref={navigationRef} linking={linking}>
			<DrawerScreen />
		</NavigationContainer>
	);
};

export default App;
