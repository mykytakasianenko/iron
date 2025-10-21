import {
	Calendar,
	ChevronRight,
	LogOut,
	Settings,
	Target,
	Trophy,
	User,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

const menuItems = [
	{
		id: "personal",
		title: "Personal Information",
		icon: User,
		description: "Update your details",
	},
	{
		id: "goals",
		title: "Fitness Goals",
		icon: Target,
		description: "Manage your objectives",
	},
	{
		id: "achievements",
		title: "Achievements",
		icon: Trophy,
		description: "View your milestones",
	},
	{
		id: "schedule",
		title: "Workout Schedule",
		icon: Calendar,
		description: "Manage your routine",
	},
	{
		id: "settings",
		title: "Settings",
		icon: Settings,
		description: "App preferences",
	},
];

const stats = [
	{ label: "Workouts", value: "48" },
	{ label: "Streak", value: "12" },
	{ label: "Goal", value: "Legs" },
];

export default function ProfileScreen() {
	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	const handleMenuPress = (id: string) => {
		console.log("Navigate to:", id);
		// TODO: Navigate to specific screen
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				<View className="items-center pt-6 pb-8 px-6">
					{/* Avatar */}
					<View className="relative mb-4">
						<View className="w-28 h-28 rounded-full bg-primary/20 items-center justify-center border-4 border-primary/30">
							<Text className="text-5xl">💪</Text>
						</View>
						<Pressable className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-4 border-background">
							<Icon
								as={Settings}
								size={16}
								className="text-primary-foreground"
							/>
						</Pressable>
					</View>

					{/* User Info */}
					<Text className="text-2xl font-bold text-foreground mb-1">
						John Doe
					</Text>
					<Text className="text-muted-foreground text-base mb-6">
						john.doe@example.com
					</Text>

					{/* Stats */}
					<View className="flex-row gap-4 w-full max-w-sm">
						{stats.map((stat, index) => (
							<View
								key={index}
								className="flex-1 bg-muted/50 rounded-xl p-4 items-center"
							>
								<Text className="text-2xl font-bold text-foreground mb-1">
									{stat.value}
								</Text>
								<Text className="text-muted-foreground text-sm">
									{stat.label}
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Menu Items */}
				<View className="px-6 pb-6">
					<View className="gap-2">
						{menuItems.map((item) => (
							<Pressable
								key={item.id}
								onPress={() => handleMenuPress(item.id)}
								className="flex-row items-center bg-card border border-border rounded-xl p-4 active:opacity-70"
							>
								<View className="bg-primary/10 rounded-full p-2.5 mr-4">
									<Icon as={item.icon} size={20} className="text-primary" />
								</View>
								<View className="flex-1">
									<Text className="text-foreground font-semibold text-base mb-0.5">
										{item.title}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{item.description}
									</Text>
								</View>
								<Icon
									as={ChevronRight}
									size={20}
									className="text-muted-foreground"
								/>
							</Pressable>
						))}
					</View>
				</View>

				{/* Sign Out Button */}
				<View className="px-6 pb-8">
					<Button
						variant="destructive"
						className="w-full h-14 flex-row items-center gap-2"
						onPress={handleSignOut}
					>
						<Icon as={LogOut} className="text-destructive-foreground" />
						<Text className="text-base font-semibold">Sign Out</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
