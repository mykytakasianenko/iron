import { Link, Stack } from "expo-router";
import { BicepsFlexed, Target, TrendingUp, Zap } from "lucide-react-native";
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
	height: 140,
	width: 140,
};

export default function Screen() {
	const { colorScheme } = useColorScheme();

	return (
		<SafeAreaView className="flex-1 bg-background">
			<Stack.Screen options={SCREEN_OPTIONS} />

			{/* Hero Background Image */}
			<View className="absolute inset-0">
				<Image
					source={{
						uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
					}}
					className="w-full h-full"
					resizeMode="cover"
					blurRadius={2}
				/>
				<View className="absolute inset-0 bg-black/70" />
			</View>

			<View className="flex-1 justify-between px-6 pt-16 pb-8">
				{/* Logo and Title Section */}
				<View className="items-center gap-6">
					<Image
						source={LOGO[colorScheme ?? "light"]}
						style={IMAGE_STYLE}
						resizeMode="contain"
					/>
				</View>

				{/* Features Section */}
				<View className="gap-3 mb-6">
					<View className="flex-row items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
						<View className="bg-primary/20 rounded-full p-2">
							<Icon as={Target} size={24} className="text-primary" />
						</View>
						<View className="flex-1">
							<Text className="text-white font-semibold text-base">
								Personalized Plans
							</Text>
							<Text className="text-white/70 text-sm">
								Custom workouts for your goals
							</Text>
						</View>
					</View>

					<View className="flex-row items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
						<View className="bg-primary/20 rounded-full p-2">
							<Icon as={TrendingUp} size={24} className="text-primary" />
						</View>
						<View className="flex-1">
							<Text className="text-white font-semibold text-base">
								Track Progress
							</Text>
							<Text className="text-white/70 text-sm">
								Monitor your gains and improvements
							</Text>
						</View>
					</View>

					<View className="flex-row items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
						<View className="bg-primary/20 rounded-full p-2">
							<Icon as={Zap} size={24} className="text-primary" />
						</View>
						<View className="flex-1">
							<Text className="text-white font-semibold text-base">
								Stay Motivated
							</Text>
							<Text className="text-white/70 text-sm">
								Achieve consistency with smart reminders
							</Text>
						</View>
					</View>
				</View>

				{/* CTA Buttons */}
				<View className="gap-3">
					<Link href="/onboarding/focus" asChild>
						<Button size="lg" className="h-14">
							<Text className="text-base font-semibold">
								Start Your Journey
							</Text>
						</Button>
					</Link>
					<Link href="/auth/login" asChild>
						<Button
							variant="ghost"
							className="flex-row items-center justify-center gap-2 h-12 bg-white/10"
						>
							<Text className="text-white font-medium">
								I already have an account
							</Text>
							<Icon as={BicepsFlexed} className="text-white" />
						</Button>
					</Link>
				</View>
			</View>
		</SafeAreaView>
	);
}
