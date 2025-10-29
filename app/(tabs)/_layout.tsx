import { Tabs } from "expo-router";
import { BarChart, Home, MessageCircleIcon, Settings } from "lucide-react-native";

export default function Layout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: "Home",
					tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
				}}
			/>

			<Tabs.Screen
				name="insights"
				options={{
					tabBarLabel: "Insights",
					tabBarIcon: ({ color, size }) => (
						<BarChart color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="chat"
				options={{
					tabBarLabel: "Chat",
					tabBarIcon: ({ color, size }) => (
						<MessageCircleIcon color={color} size={size} />
					),
				}}
			/>

			<Tabs.Screen
				name="settings"
				options={{
					tabBarLabel: "Settings",
					tabBarIcon: ({ color, size }) => (
						<Settings color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
