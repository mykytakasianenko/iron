import {
  ArrowLeft,
  Plus,
  Target,
  Image as ImageIcon,
  Edit,
  Trash2,
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
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useWorkoutsStore, Exercise } from "@/state/workouts";
import { ExportWorkoutsButton } from "@/components/ExportWorkoutsButton";

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const workoutId = parseInt(id as string);

  const {
    getWorkoutById,
    fetchWorkoutById,
    updateWorkoutDb,
    createExercise,
    updateExerciseDb,
    deleteExerciseDb,
    uploadExerciseCover,
    isLoading,
  } = useWorkoutsStore();

  const [workout, setWorkout] = useState(getWorkoutById(workoutId));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState(workout?.name || "");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    await fetchWorkoutById(workoutId);
    const updatedWorkout = getWorkoutById(workoutId);
    setWorkout(updatedWorkout);
    setWorkoutName(updatedWorkout?.name || "");
  };

  const pickImageForExercise = async (exerciseId?: number) => {
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        if (exerciseId) {
          // Update existing exercise cover
          const coverUrl = await uploadExerciseCover(
            exerciseId,
            asset.uri,
            asset.mimeType || "image/jpeg"
          );

          if (coverUrl) {
            Alert.alert("Success", "Exercise cover updated!");
            await loadWorkout();
          }
        } else {
          // Store for new exercise
          setSelectedImage(asset.uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleUpdateWorkoutName = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    await updateWorkoutDb(workoutId, { name: workoutName });
    setEditingWorkout(false);
    await loadWorkout();
    Alert.alert("Success", "Workout name updated!");
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    if (!selectedImage) {
      Alert.alert("Error", "Please select a cover image");
      return;
    }

    setCreating(true);

    try {
      // Create exercise with temporary cover
      const tempExercise = {
        workout_id: workoutId,
        name: newExerciseName,
        cover: "temp",
      };

      await createExercise(tempExercise);

      // Reload to get the new exercise
      await loadWorkout();
      const updatedWorkout = getWorkoutById(workoutId);
      const newExercise = updatedWorkout?.exercises?.[updatedWorkout.exercises.length - 1];

      if (newExercise) {
        // Upload cover
        await uploadExerciseCover(
          newExercise.id,
          selectedImage,
          "image/jpeg"
        );
      }

      setShowCreateModal(false);
      setNewExerciseName("");
      setSelectedImage(null);
      await loadWorkout();
      Alert.alert("Success", "Exercise created!");
    } catch (error) {
      console.error("Error creating exercise:", error);
      Alert.alert("Error", "Failed to create exercise. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteExerciseDb(exercise.id);
            await loadWorkout();
            Alert.alert("Success", "Exercise deleted!");
          },
        },
      ]
    );
  };

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-muted-foreground mt-4">Loading workout...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Pressable>

          <View className="flex-1">
            {editingWorkout ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  placeholderTextColor="#888"
                  autoFocus
                />
                <Button onPress={handleUpdateWorkoutName} className="h-10 px-3">
                  <Text className="text-sm font-semibold">Save</Text>
                </Button>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-foreground flex-1">
                  {workout.name}
                </Text>
                <Pressable onPress={() => setEditingWorkout(true)}>
                  <Icon as={Edit} size={20} className="text-muted-foreground" />
                </Pressable>
                <ExportWorkoutsButton workoutId={workoutId} />
              </View>
            )}
          </View>
        </View>

        {/* Workout Cover */}
        <View className="px-6 pb-6">
          <View className="relative h-48 rounded-xl overflow-hidden bg-muted">
            {workout.cover && workout.cover !== "temp" ? (
              <Image
                source={{ uri: workout.cover }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary/10">
                <Icon as={Target} size={64} className="text-primary/40" />
              </View>
            )}
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-muted-foreground">
              {workout.exercises?.length || 0} exercise
              {workout.exercises?.length !== 1 ? "s" : ""}
            </Text>
            <Text className="text-muted-foreground text-sm">
              Created {new Date(workout.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Exercises Section */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-foreground">
              Exercises
            </Text>
            <Button
              onPress={() => setShowCreateModal(true)}
              className="h-10 px-4 flex-row items-center gap-2"
            >
              <Icon as={Plus} size={18} className="text-primary-foreground" />
              <Text className="text-sm font-semibold">Add</Text>
            </Button>
          </View>

          <View className="gap-3">
            {workout.exercises?.map((exercise, index) => (
              <Pressable
                key={exercise.id}
                onLongPress={() => handleDeleteExercise(exercise)}
                className="bg-card border border-border rounded-xl overflow-hidden active:opacity-70"
              >
                <View className="flex-row">
                  {/* Exercise Cover */}
                  <View className="relative w-28 h-28 bg-muted">
                    {exercise.cover && exercise.cover !== "temp" ? (
                      <Image
                        source={{ uri: exercise.cover }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-primary/10">
                        <Icon as={Target} size={32} className="text-primary/40" />
                      </View>
                    )}
                    <Pressable
                      onPress={() => pickImageForExercise(exercise.id)}
                      className="absolute bottom-1 right-1 bg-background/90 rounded-full p-1.5"
                    >
                      <Icon as={ImageIcon} size={14} className="text-foreground" />
                    </Pressable>
                  </View>

                  {/* Exercise Info */}
                  <View className="flex-1 p-4 justify-center">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="bg-primary/20 rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-primary text-xs font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <Text className="text-lg font-semibold text-foreground flex-1">
                        {exercise.name}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      Tap and hold to delete
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {(!workout.exercises || workout.exercises.length === 0) && (
            <View className="items-center justify-center py-12">
              <Icon as={Target} size={64} className="text-muted-foreground/40 mb-4" />
              <Text className="text-muted-foreground text-center mb-2">
                No exercises yet
              </Text>
              <Text className="text-muted-foreground/60 text-center text-sm">
                Add your first exercise to this workout
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <View className="absolute inset-0 bg-background/95 items-center justify-center px-6">
          <View className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Add Exercise
            </Text>

            <TextInput
              placeholder="Exercise name"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholderTextColor="#888"
            />

            <Pressable
              onPress={() => pickImageForExercise()}
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
                  setNewExerciseName("");
                  setSelectedImage(null);
                }}
                className="flex-1"
                disabled={creating}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                onPress={handleCreateExercise}
                className="flex-1"
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-semibold">Add</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}