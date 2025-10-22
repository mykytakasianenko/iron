import { ScrollView, View, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Edit2, Trash2, Play, Clock, Target, Flame } from "lucide-react-native";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const initialExercises = [
	{
		id: "1",
		name: "Bench Press",
		category: "Chest",
		sets: 4,
		reps: 10,
		weight: "80kg",
		duration: "15 min",
		calories: 120,
		image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
		completed: false
	},
	{
		id: "2",
		name: "Squats",
		category: "Legs",
		sets: 4,
		reps: 12,
		weight: "100kg",
		duration: "20 min",
		calories: 180,
		image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80",
		completed: true
	},
	{
		id: "3",
		name: "Deadlift",
		category: "Back",
		sets: 3,
		reps: 8,
		weight: "120kg",
		duration: "18 min",
		calories: 150,
		image: "https://images.unsplash.com/photo-1532384816664-01b8b7238c8d?w=400&q=80",
		completed: false
	},
	{
		id: "4",
		name: "Pull-ups",
		category: "Back",
		sets: 3,
		reps: 12,
		weight: "Body",
		duration: "10 min",
		calories: 90,
		image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=80",
		completed: false
	}
];

export default function HomeScreen() {
	const [exercises, setExercises] = useState(initialExercises);
	const [editMode, setEditMode] = useState(false);

	const handleToggleComplete = (id: string) => {
		setExercises(exercises.map(ex =>
			ex.id === id ? { ...ex, completed: !ex.completed } : ex
		));
	};

	const handleDelete = (id: string) => {
		setExercises(exercises.filter(ex => ex.id !== id));
	};

	const handleAddExercise = () => {
		console.log("Navigate to add exercise screen");
	};

	const handleEditExercise = (id: string) => {
		console.log("Navigate to edit exercise:", id);
	};

	const completedCount = exercises.filter(ex => ex.completed).length;
	const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
	const totalDuration = exercises.reduce((sum, ex) => {
		const mins = parseInt(ex.duration);
		return sum + mins;
	}, 0);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				{/* Header */}
				<View className="px-6 pt-6 pb-4">
					<View className="flex-row justify-between items-center mb-2">
						<View>
							<Text className="text-3xl font-bold text-foreground mb-1">
								Today's Workout
							</Text>
							<Text className="text-muted-foreground text-base">
								{new Date().toLocaleDateString('en-US', {
									weekday: 'long',
									month: 'short',
									day: 'numeric'
								})}
							</Text>
						</View>
						<Pressable
							onPress={() => setEditMode(!editMode)}
							className="bg-muted rounded-full p-3"
						>
							<Icon
								as={Edit2}
								size={20}
								className={editMode ? "text-primary" : "text-muted-foreground"}
							/>
						</Pressable>
					</View>
				</View>

				{/* Summary Cards */}
				<View className="px-6 mb-6">
					<View className="flex-row gap-2">
						<View className="flex-1 bg-card border border-border rounded-xl p-3">
							<Icon as={Target} size={16} className="text-primary mb-1" />
							<Text className="text-foreground font-bold text-lg">{completedCount}/{exercises.length}</Text>
							<Text className="text-muted-foreground text-xs">Completed</Text>
						</View>
						<View className="flex-1 bg-card border border-border rounded-xl p-3">
							<Icon as={Clock} size={16} className="text-blue-500 mb-1" />
							<Text className="text-foreground font-bold text-lg">{totalDuration}m</Text>
							<Text className="text-muted-foreground text-xs">Duration</Text>
						</View>
						<View className="flex-1 bg-card border border-border rounded-xl p-3">
							<Icon as={Flame} size={16} className="text-orange-500 mb-1" />
							<Text className="text-foreground font-bold text-lg">{totalCalories}</Text>
							<Text className="text-muted-foreground text-xs">Calories</Text>
						</View>
					</View>
				</View>

				{/* Exercises List */}
				<View className="px-6 mb-6">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-foreground font-semibold text-xl">
							Exercises
						</Text>
						<Button
							size="sm"
							className="flex-row items-center gap-2"
							onPress={handleAddExercise}
						>
							<Icon as={Plus} size={16} className="text-primary-foreground" />
							<Text className="text-sm font-semibold">Add</Text>
						</Button>
					</View>

					<View className="gap-4">
						{exercises.map((exercise) => (
							<View key={exercise.id} className="relative">
								<Pressable
									onPress={() => !editMode && handleToggleComplete(exercise.id)}
									className={`bg-card border rounded-2xl overflow-hidden ${exercise.completed
											? "border-primary opacity-75"
											: "border-border"
										}`}
								>
									<View className="flex-row">
										{/* Image */}
										<View className="relative w-24 h-24">
											<Image
												source={{ uri: exercise.image }}
												className="w-full h-full"
												resizeMode="cover"
											/>
											{exercise.completed && (
												<View className="absolute inset-0 bg-primary/40 items-center justify-center">
													<Text className="text-3xl">✓</Text>
												</View>
											)}
										</View>

										{/* Content */}
										<View className="flex-1 p-3 justify-between">
											<View>
												<View className="flex-row items-center justify-between mb-1">
													<Text className="text-foreground font-bold text-base">
														{exercise.name}
													</Text>
													{!editMode && !exercise.completed && (
														<Pressable className="bg-primary/10 rounded-full p-1.5">
															<Icon as={Play} size={14} className="text-primary" />
														</Pressable>
													)}
												</View>
												<Text className="text-muted-foreground text-xs mb-2">
													{exercise.category}
												</Text>
											</View>
											<View className="flex-row items-center gap-3">
												<Text className="text-muted-foreground text-xs">
													{exercise.sets} × {exercise.reps} • {exercise.weight}
												</Text>
												<Text className="text-primary text-xs font-medium">
													{exercise.duration}
												</Text>
											</View>
										</View>
									</View>
								</Pressable>

								{/* Edit Mode Actions */}
								{editMode && (
									<View className="absolute top-2 right-2 flex-row gap-2">
										<Pressable
											onPress={() => handleEditExercise(exercise.id)}
											className="bg-blue-500 rounded-full p-2"
										>
											<Icon as={Edit2} size={14} className="text-white" />
										</Pressable>
										<Pressable
											onPress={() => handleDelete(exercise.id)}
											className="bg-red-500 rounded-full p-2"
										>
											<Icon as={Trash2} size={14} className="text-white" />
										</Pressable>
									</View>
								)}
							</View>
						))}
					</View>
				</View>

				{/* Start Workout Button */}
				{!editMode && completedCount < exercises.length && (
					<View className="px-6 pb-8">
						<Button className="w-full h-14 flex-row items-center gap-2">
							<Icon as={Play} className="text-primary-foreground" />
							<Text className="text-base font-semibold">
								{completedCount > 0 ? "Continue Workout" : "Start Workout"}
							</Text>
						</Button>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}