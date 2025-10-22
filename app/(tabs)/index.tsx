import {
	Plus,
	Dumbbell,
	Calendar,
	Flame,
	Image as ImageIcon,
} from "lucide-react-native";
import {
	Pressable,
	ScrollView,
	View,
	Image,
	Alert,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useWorkoutsStore, Workout } from "@/state/workouts";

export default function HomeScreen() {
	const router = useRouter();
	const {
		workouts,
		fetchWorkouts,
		createWorkout,
		updateWorkoutDb,
		deleteWorkoutDb,
		uploadWorkoutCover,
		isLoading,
	} = useWorkoutsStore();

	const [userId, setUserId] = useState<string>("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newWorkoutName, setNewWorkoutName] = useState("");
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		loadWorkouts();
	}, []);

	const loadWorkouts = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (user) {
			setUserId(user.id);
			await fetchWorkouts(user.id);
		}
	};

	const pickImageForWorkout = async (workoutId?: number) => {
		try {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Please grant camera roll permissions to upload a photo."
				);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [16, 9],
				quality: 0.8,
			});

			if (!result.canceled) {
				const asset = result.assets[0];

				if (workoutId) {
					// Update existing workout cover
					const coverUrl = await uploadWorkoutCover(
						workoutId,
						asset.uri,
						asset.mimeType || "image/jpeg"
					);

					if (coverUrl) {
						Alert.alert("Success", "Workout cover updated!");
					}
				} else {
					// Store for new workout
					setSelectedImage(asset.uri);
				}
			}
		} catch (error) {
			console.error("Error picking image:", error);
			Alert.alert("Error", "Failed to pick image. Please try again.");
		}
	};

	const handleCreateWorkout = async () => {
		if (!newWorkoutName.trim()) {
			Alert.alert("Error", "Please enter a workout name");
			return;
		}

		if (!selectedImage) {
			Alert.alert("Error", "Please select a cover image");
			return;
		}

		setCreating(true);

		try {
			// Create workout with temporary cover
			const tempWorkout = {
				user_id: userId,
				name: newWorkoutName,
				cover: "temp",
			};

			await createWorkout(tempWorkout);

			// Get the newly created workout
			const newWorkout = workouts[0]; // Assuming it's added to the beginning

			if (newWorkout) {
				// Upload cover
				await uploadWorkoutCover(
					newWorkout.id,
					selectedImage,
					"image/jpeg"
				);
			}

			setShowCreateModal(false);
			setNewWorkoutName("");
			setSelectedImage(null);
			Alert.alert("Success", "Workout created!");
		} catch (error) {
			console.error("Error creating workout:", error);
			Alert.alert("Error", "Failed to create workout. Please try again.");
		} finally {
			setCreating(false);
		}
	};

	const handleDeleteWorkout = (workout: Workout) => {
		Alert.alert(
			"Delete Workout",
			`Are you sure you want to delete "${workout.name}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						await deleteWorkoutDb(workout.id);
						Alert.alert("Success", "Workout deleted!");
					},
				},
			]
		);
	};

	const handleWorkoutPress = (workout: Workout) => {
		router.push(`/workout/${workout.id}`);
	};

	if (isLoading && workouts.length === 0) {
		return (
			<SafeAreaView className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" color="#8B5CF6" />
				<Text className="text-muted-foreground mt-4">Loading workouts...</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1">
				{/* Header */}
				<View className="px-6 pt-6 pb-4">
					<Text className="text-3xl font-bold text-foreground mb-2">
						My Workouts
					</Text>
					<Text className="text-muted-foreground text-base">
						{workouts.length} workout{workouts.length !== 1 ? "s" : ""} available
					</Text>
				</View>

				{/* Stats Cards */}
				<View className="px-6 pb-6">
					<View className="flex-row gap-3">
						<View className="flex-1 bg-primary/10 rounded-xl p-4">
							<Icon as={Dumbbell} size={24} className="text-primary mb-2" />
							<Text className="text-2xl font-bold text-foreground">
								{workouts.length}
							</Text>
							<Text className="text-muted-foreground text-sm">Workouts</Text>
						</View>
						<View className="flex-1 bg-orange-500/10 rounded-xl p-4">
							<Icon as={Flame} size={24} className="text-orange-500 mb-2" />
							<Text className="text-2xl font-bold text-foreground">12</Text>
							<Text className="text-muted-foreground text-sm">Day Streak</Text>
						</View>
						<View className="flex-1 bg-green-500/10 rounded-xl p-4">
							<Icon as={Calendar} size={24} className="text-green-500 mb-2" />
							<Text className="text-2xl font-bold text-foreground">48</Text>
							<Text className="text-muted-foreground text-sm">Completed</Text>
						</View>
					</View>
				</View>

				{/* Workouts List */}
				<View className="px-6 pb-6">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-xl font-semibold text-foreground">
							Workouts
						</Text>
						<Button
							onPress={() => setShowCreateModal(true)}
							className="h-10 px-4 flex-row items-center gap-2"
						>
							<Icon as={Plus} size={18} className="text-primary-foreground" />
							<Text className="text-sm font-semibold">New</Text>
						</Button>
					</View>

					<View className="gap-3">
						{workouts.map((workout) => (
							<Pressable
								key={workout.id}
								onPress={() => handleWorkoutPress(workout)}
								onLongPress={() => handleDeleteWorkout(workout)}
								className="bg-card border border-border rounded-xl overflow-hidden active:opacity-70"
							>
								{/* Workout Cover */}
								<View className="relative h-40 bg-muted">
									{workout.cover && workout.cover !== "temp" ? (
										<Image
											source={{ uri: workout.cover }}
											className="w-full h-full"
											resizeMode="cover"
										/>
									) : (
										<View className="w-full h-full items-center justify-center bg-primary/10">
											<Icon as={Dumbbell} size={48} className="text-primary/40" />
										</View>
									)}
									<Pressable
										onPress={() => pickImageForWorkout(workout.id)}
										className="absolute top-2 right-2 bg-background/80 rounded-full p-2"
									>
										<Icon as={ImageIcon} size={20} className="text-foreground" />
									</Pressable>
								</View>

								{/* Workout Info */}
								<View className="p-4">
									<Text className="text-lg font-semibold text-foreground mb-1">
										{workout.name}
									</Text>
									<Text className="text-muted-foreground text-sm">
										{workout.exercises?.length || 0} exercise
										{workout.exercises?.length !== 1 ? "s" : ""}
									</Text>
								</View>
							</Pressable>
						))}
					</View>

					{workouts.length === 0 && (
						<View className="items-center justify-center py-12">
							<Icon as={Dumbbell} size={64} className="text-muted-foreground/40 mb-4" />
							<Text className="text-muted-foreground text-center mb-2">
								No workouts yet
							</Text>
							<Text className="text-muted-foreground/60 text-center text-sm">
								Create your first workout to get started
							</Text>
						</View>
					)}
				</View>
			</ScrollView>

			{/* Create Workout Modal */}
			{showCreateModal && (
				<View className="absolute inset-0 bg-background/95 items-center justify-center px-6">
					<View className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
						<Text className="text-2xl font-bold text-foreground mb-4">
							Create Workout
						</Text>

						<TextInput
							placeholder="Workout name"
							value={newWorkoutName}
							onChangeText={setNewWorkoutName}
							className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
							placeholderTextColor="#888"
						/>

						<Pressable
							onPress={() => pickImageForWorkout()}
							className="bg-muted border-2 border-dashed border-border rounded-xl h-40 items-center justify-center mb-4"
						>
							{selectedImage ? (
								<Image
									source={{ uri: selectedImage }}
									className="w-full h-full rounded-xl"
									resizeMode="cover"
								/>
							) : (
								<View className="items-center">
									<Icon as={ImageIcon} size={48} className="text-muted-foreground mb-2" />
									<Text className="text-muted-foreground">Tap to select cover</Text>
								</View>
							)}
						</Pressable>

						<View className="flex-row gap-3">
							<Button
								variant="outline"
								onPress={() => {
									setShowCreateModal(false);
									setNewWorkoutName("");
									setSelectedImage(null);
								}}
								className="flex-1"
								disabled={creating}
							>
								<Text>Cancel</Text>
							</Button>
							<Button
								onPress={handleCreateWorkout}
								className="flex-1"
								disabled={creating}
							>
								{creating ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text className="font-semibold">Create</Text>
								)}
							</Button>
						</View>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}