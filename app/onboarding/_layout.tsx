import { Stack } from "expo-router";

export default function Layout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: true }} />
			<Stack.Screen name="focus" options={{ headerShown: false }} />
			<Stack.Screen name="time" options={{ headerShown: false }} />
		</Stack>
	);
}
