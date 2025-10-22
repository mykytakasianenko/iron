import { ScrollView, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, Flame, Trophy, Calendar, Target, Zap } from "lucide-react-native";
import { useState } from "react";
import { LineChart, BarChart } from "recharts";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";

const workoutData = [
	{ day: "Mon", workouts: 1, calories: 350 },
	{ day: "Tue", workouts: 0, calories: 0 },
	{ day: "Wed", workouts: 2, calories: 520 },
	{ day: "Thu", workouts: 1, calories: 380 },
	{ day: "Fri", workouts: 1, calories: 420 },
	{ day: "Sat", workouts: 2, calories: 650 },
	{ day: "Sun", workouts: 1, calories: 400 }
];

const monthlyProgress = [
	{ month: "Jan", count: 12 },
	{ month: "Feb", count: 15 },
	{ month: "Mar", count: 18 },
	{ month: "Apr", count: 14 },
	{ month: "May", count: 20 },
	{ month: "Jun", count: 22 }
];

const timeFrames = ["Week", "Month", "Year"];

const insights = [
	{
		icon: Flame,
		title: "Hot Streak!",
		description: "12 days in a row",
		color: "text-orange-500",
		bg: "bg-orange-500/10"
	},
	{
		icon: Trophy,
		title: "Personal Best",
		description: "6 workouts this week",
		color: "text-yellow-500",
		bg: "bg-yellow-500/10"
	},
	{
		icon: Target,
		title: "Goal Progress",
		description: "73% to monthly target",
		color: "text-blue-500",
		bg: "bg-blue-500/10"
	},
	{
		icon: Zap,
		title: "Most Active",
		description: "Saturday mornings",
		color: "text-purple-500",
		bg: "bg-purple-500/10"
	}
];

export default function StatisticsScreen() {
	const [selectedTimeFrame, setSelectedTimeFrame] = useState("Week");

	const totalWorkouts = workoutData.reduce((sum, day) => sum + day.workouts, 0);
	const totalCalories = workoutData.reduce((sum, day) => sum + day.calories, 0);
	const avgPerDay = Math.round(totalCalories / 7);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				{/* Header */}
				<View className="px-6 pt-6 pb-4">
					<Text className="text-3xl font-bold text-foreground mb-2">
						Your Statistics
					</Text>
					<Text className="text-muted-foreground text-base">
						Track your progress and achievements
					</Text>
				</View>

				{/* Time Frame Selector */}
				<View className="px-6 mb-6">
					<View className="flex-row bg-muted rounded-xl p-1">
						{timeFrames.map((frame) => (
							<Pressable
								key={frame}
								onPress={() => setSelectedTimeFrame(frame)}
								className={`flex-1 py-2 rounded-lg ${selectedTimeFrame === frame ? "bg-primary" : ""
									}`}
							>
								<Text
									className={`text-center font-semibold ${selectedTimeFrame === frame
											? "text-primary-foreground"
											: "text-muted-foreground"
										}`}
								>
									{frame}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{/* Key Metrics */}
				<View className="px-6 mb-6">
					<View className="flex-row gap-3">
						<View className="flex-1 bg-card border border-border rounded-xl p-4">
							<View className="flex-row items-center mb-2">
								<Icon as={Calendar} size={18} className="text-primary mr-2" />
								<Text className="text-muted-foreground text-sm">Workouts</Text>
							</View>
							<Text className="text-3xl font-bold text-foreground">{totalWorkouts}</Text>
							<Text className="text-green-500 text-xs mt-1">↑ 23% vs last week</Text>
						</View>

						<View className="flex-1 bg-card border border-border rounded-xl p-4">
							<View className="flex-row items-center mb-2">
								<Icon as={Flame} size={18} className="text-orange-500 mr-2" />
								<Text className="text-muted-foreground text-sm">Calories</Text>
							</View>
							<Text className="text-3xl font-bold text-foreground">{totalCalories}</Text>
							<Text className="text-green-500 text-xs mt-1">↑ 15% vs last week</Text>
						</View>
					</View>
				</View>

				{/* Weekly Activity Chart */}
				<View className="px-6 mb-6">
					<View className="bg-card border border-border rounded-xl p-4">
						<Text className="text-foreground font-semibold text-lg mb-4">
							Weekly Activity
						</Text>
						<View className="flex-row justify-between items-end h-40 px-2">
							{workoutData.map((day, index) => {
								const height = (day.workouts / 2) * 100;
								return (
									<View key={index} className="flex-1 items-center">
										<View className="flex-1 justify-end w-full px-1">
											<View
												className="bg-primary rounded-t-lg w-full"
												style={{ height: `${height}%`, minHeight: day.workouts > 0 ? 20 : 0 }}
											/>
										</View>
										<Text className="text-muted-foreground text-xs mt-2">
											{day.day}
										</Text>
									</View>
								);
							})}
						</View>
					</View>
				</View>

				{/* Monthly Progress */}
				<View className="px-6 mb-6">
					<View className="bg-card border border-border rounded-xl p-4">
						<Text className="text-foreground font-semibold text-lg mb-4">
							6-Month Progress
						</Text>
						<View className="flex-row justify-between items-end h-32 px-2">
							{monthlyProgress.map((month, index) => {
								const height = (month.count / 25) * 100;
								return (
									<View key={index} className="flex-1 items-center">
										<View className="flex-1 justify-end w-full px-1">
											<View
												className="bg-blue-500 rounded-t-lg w-full"
												style={{ height: `${height}%` }}
											/>
										</View>
										<Text className="text-muted-foreground text-xs mt-2">
											{month.month}
										</Text>
									</View>
								);
							})}
						</View>
					</View>
				</View>

				{/* Insights */}
				<View className="px-6 mb-8">
					<Text className="text-foreground font-semibold text-xl mb-4">
						Insights
					</Text>
					<View className="gap-3">
						{insights.map((insight, index) => (
							<View
								key={index}
								className="bg-card border border-border rounded-xl p-4 flex-row items-center"
							>
								<View className={`${insight.bg} rounded-full p-3 mr-4`}>
									<Icon as={insight.icon} size={24} className={insight.color} />
								</View>
								<View className="flex-1">
									<Text className="text-foreground font-semibold text-base mb-1">
										{insight.title}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{insight.description}
									</Text>
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}