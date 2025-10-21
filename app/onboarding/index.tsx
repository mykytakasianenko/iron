import { Link, Stack } from "expo-router";
import { BicepsFlexed } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Image, type ImageStyle, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const LOGO = {
	light: require("@/assets/images/logo-light.png"),
	dark: require("@/assets/images/logo-dark.png"),
};

const SCREEN_OPTIONS = {
	title: "",
	headerTransparent: true,
	headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
	height: 176,
	width: 176,
};

export default function Screen() {
	const { colorScheme } = useColorScheme();

	return (
		<SafeAreaView className="flex-1">
			<Stack.Screen options={SCREEN_OPTIONS} />
			<View className="flex-1 items-center justify-between p-24 gap-8">
				<Image
					source={LOGO[colorScheme ?? "light"]}
					style={IMAGE_STYLE}
					resizeMode="contain"
				/>
				<View className="flex gap-2">
					<Link href="/onboarding/focus" asChild>
						<Button size="lg">
							<Text>Let's go </Text>
						</Button>
					</Link>
					<Link href="/auth/login" asChild>
						<Button variant="ghost" className="flex-row items-center gap-2">
							<Text className="flex-shrink">I already have an account</Text>
							<Icon as={BicepsFlexed} />
						</Button>
					</Link>
				</View>
			</View>
		</SafeAreaView>
	);
}
