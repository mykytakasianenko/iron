import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

const goals = [
	{
		id: "legs",
		title: "Legs",
		emoji: "🦵",
		gradient: "from-blue-500 to-cyan-500",
		image:
			"https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80",
	},
	{
		id: "chest",
		title: "Chest",
		emoji: "💪",
		gradient: "from-red-500 to-orange-500",
		image:
			"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
	},
	{
		id: "back",
		title: "Back",
		emoji: "🏋️",
		gradient: "from-purple-500 to-pink-500",
		image:
			"https://images.unsplash.com/photo-1532384816664-01b8b7238c8d?w=400&q=80",
	},
	{
		id: "weight",
		title: "Lose Weight",
		emoji: "🔥",
		gradient: "from-amber-500 to-red-500",
		image:
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
	},
	{
		id: "strength",
		title: "Strength",
		emoji: "⚡",
		gradient: "from-green-500 to-emerald-500",
		image:
			"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
	},
	{
		id: "stamina",
		title: "Stamina",
		emoji: "🏃",
		gradient: "from-indigo-500 to-blue-500",
		image:
			"https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80",
	},
];

export default function SetGoalPage() {
	const [selected, setSelected] = useState<string | null>(null);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 px-6">
				<View className="pt-8 pb-6">
					<Text className="text-4xl font-bold text-foreground mb-2">
						Choose Your Focus
					</Text>
					<Text className="text-base text-muted-foreground">
						Select your primary training goal to get personalized workouts
					</Text>
				</View>

				<View className="pb-8 gap-4">
					{goals.map((goal) => (
						<Pressable
							key={goal.id}
							onPress={() => setSelected(goal.id)}
							className={`relative overflow-hidden rounded-2xl h-32 ${
								selected === goal.id ? "opacity-100" : "opacity-90"
							}`}
						>
							<Image
								source={{ uri: goal.image }}
								className="absolute inset-0 w-full h-full"
								resizeMode="cover"
							/>
							<View className="absolute inset-0 bg-black/40" />

							{selected === goal.id && (
								<View className="absolute top-3 right-3 rounded-full w-8 h-8 items-center justify-center"></View>
							)}

							<View className="flex-1 justify-end p-5">
								<View className="flex-row items-center gap-3">
									<Text className="text-4xl">{goal.emoji}</Text>
									<View>
										<Text className="text-2xl font-bold text-white">
											{goal.title}
										</Text>
									</View>
								</View>
							</View>

							{selected === goal.id && (
								<View className="absolute inset-0 border-4 border-white rounded-2xl" />
							)}
						</Pressable>
					))}
				</View>

				{selected && (
					<View className="pb-8">
						<Link
							href="/onboarding/time"
							className="bg-primary rounded-xl py-4 items-center active:opacity-80"
							asChild
						>
							<Text className="text-primary-foreground font-semibold text-lg text-center">
								Continue
							</Text>
						</Link>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
