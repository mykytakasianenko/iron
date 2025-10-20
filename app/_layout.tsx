import "@/global.css";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { NAV_THEME } from "@/lib/theme";
import { useAuthContext } from "@/hooks/use-auth";
import AuthProvider from "@/providers/auth-provider";
import { SplashScreenController } from "@/components/SplashScreen";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

function RootNavigator() {
	const { isLoggedIn } = useAuthContext()
	return (
		<Stack>
			<Stack.Protected guard={isLoggedIn}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack.Protected>
			<Stack.Protected guard={!isLoggedIn}>
				<Stack.Screen name="onboarding/index" options={{ headerShown: true }} />
				<Stack.Screen name="auth/login" options={{ headerShown: false }} />
				<Stack.Screen name="auth/register" options={{ headerShown: false }} />
			</Stack.Protected>
			<Stack.Screen name="+not-found" />
		</Stack>
	)
}

export default function RootLayout() {
	const { colorScheme } = useColorScheme();


	return (
		<ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
			<AuthProvider>
				<SplashScreenController />
				<RootNavigator />
				<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
				<PortalHost />
			</AuthProvider>
		</ThemeProvider>
	);
}
