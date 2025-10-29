import * as SecureStore from "expo-secure-store";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export type Exercise = {
  id: number;
  name: string;
  cover: string;
  workout_id: number;
  created_at: string;
};

export type Workout = {
  id: number;
  user_id: string;
  cover: string;
  name: string;
  created_at: string;
  exercises?: Exercise[];
};

type WorkoutsState = {
  workouts: Workout[];
  selectedWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;

  // Supabase Workout actions
  fetchWorkouts: (userId: string) => Promise<void>;
  fetchWorkoutById: (workoutId: number) => Promise<void>;
  createWorkout: (workout: Omit<Workout, "id" | "created_at">) => Promise<void>;
  updateWorkoutDb: (workoutId: number, updates: Partial<Omit<Workout, "id" | "created_at">>) => Promise<void>;
  deleteWorkoutDb: (workoutId: number) => Promise<void>;
  uploadWorkoutCover: (workoutId: number, fileUri: string, fileType: string) => Promise<string | null>;
  deleteWorkoutCover: (coverUrl: string) => Promise<void>;

  // Supabase Exercise actions
  fetchExercises: (workoutId: number) => Promise<void>;
  createExercise: (exercise: Omit<Exercise, "id" | "created_at">) => Promise<void>;
  updateExerciseDb: (exerciseId: number, updates: Partial<Omit<Exercise, "id" | "created_at">>) => Promise<void>;
  deleteExerciseDb: (exerciseId: number) => Promise<void>;
  uploadExerciseCover: (exerciseId: number, fileUri: string, fileType: string) => Promise<string | null>;
  deleteExerciseCover: (coverUrl: string) => Promise<void>;

  // Local state actions
  setWorkouts: (workouts: Workout[]) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: number, updates: Partial<Workout>) => void;
  deleteWorkout: (id: number) => void;
  selectWorkout: (workout: Workout | null) => void;
  getWorkoutById: (id: number) => Workout | undefined;
  addExerciseToWorkout: (workoutId: number, exercise: Exercise) => void;
  updateExercise: (exerciseId: number, updates: Partial<Exercise>) => void;
  deleteExercise: (exerciseId: number) => void;
  getExercisesByWorkoutId: (workoutId: number) => Exercise[];
  clearWorkouts: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useWorkoutsStore = create(
  persist<WorkoutsState>(
    (set, get) => ({
      workouts: [],
      selectedWorkout: null,
      isLoading: false,
      error: null,

      // Supabase Workout actions
      fetchWorkouts: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select(`
              *,
              exercises (*)
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          set({ workouts: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchWorkoutById: async (workoutId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select(`
              *,
              exercises (*)
            `)
            .eq("id", workoutId)
            .single();

          if (error) throw error;

          set({ selectedWorkout: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createWorkout: async (workout) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("workouts")
            .insert([workout])
            .select()
            .single();

          console.log(`err: ${error?.message}`)

          if (error) throw error;

          set((state) => ({
            workouts: [data, ...state.workouts],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateWorkoutDb: async (workoutId: number, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("workouts")
            .update(updates)
            .eq("id", workoutId)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.map((workout) =>
              workout.id === workoutId ? { ...workout, ...data } : workout
            ),
            selectedWorkout:
              state.selectedWorkout?.id === workoutId
                ? { ...state.selectedWorkout, ...data }
                : state.selectedWorkout,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteWorkoutDb: async (workoutId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("workouts")
            .delete()
            .eq("id", workoutId);

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.filter((workout) => workout.id !== workoutId),
            selectedWorkout:
              state.selectedWorkout?.id === workoutId ? null : state.selectedWorkout,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      uploadWorkoutCover: async (workoutId: number, fileUri: string, fileType: string) => {
        set({ isLoading: true, error: null });
        try {
          // Use new File API to read file from device
          const file = new File(fileUri);
          const base64 = await file.base64();

          const fileExt = fileType.split('/')[1] || 'jpg';
          const fileName = `${workoutId}-${Date.now()}.${fileExt}`;
          const filePath = `workouts/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('workouts')
            .upload(filePath, decode(base64), {
              contentType: fileType,
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('workouts')
            .getPublicUrl(filePath);

          await get().updateWorkoutDb(workoutId, { cover: urlData.publicUrl });

          set({ isLoading: false });
          return urlData.publicUrl;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      deleteWorkoutCover: async (coverUrl: string) => {
        set({ isLoading: true, error: null });
        try {
          const urlParts = coverUrl.split('/');
          const filePath = `workouts/${urlParts[urlParts.length - 1]}`;

          const { error } = await supabase.storage
            .from('workouts')
            .remove([filePath]);

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Supabase Exercise actions
      fetchExercises: async (workoutId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("exercises")
            .select("*")
            .eq("workout_id", workoutId)
            .order("created_at", { ascending: true });

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.map((workout) =>
              workout.id === workoutId
                ? { ...workout, exercises: data || [] }
                : workout
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createExercise: async (exercise) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("exercises")
            .insert([exercise])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.map((workout) =>
              workout.id === exercise.workout_id
                ? {
                  ...workout,
                  exercises: [...(workout.exercises || []), data],
                }
                : workout
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateExerciseDb: async (exerciseId: number, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("exercises")
            .update(updates)
            .eq("id", exerciseId)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.map((workout) => ({
              ...workout,
              exercises: workout.exercises?.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, ...data } : exercise
              ),
            })),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteExerciseDb: async (exerciseId: number) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", exerciseId);

          if (error) throw error;

          set((state) => ({
            workouts: state.workouts.map((workout) => ({
              ...workout,
              exercises: workout.exercises?.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            })),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      uploadExerciseCover: async (exerciseId: number, fileUri: string, fileType: string) => {
        set({ isLoading: true, error: null });
        try {
          // Use new File API to read file from device
          const file = new File(fileUri);
          const base64 = await file.base64();

          const fileExt = fileType.split('/')[1] || 'jpg';
          const fileName = `${exerciseId}-${Date.now()}.${fileExt}`;
          const filePath = `exercises/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('exercises')
            .upload(filePath, decode(base64), {
              contentType: fileType,
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('exercises')
            .getPublicUrl(filePath);

          await get().updateExerciseDb(exerciseId, { cover: urlData.publicUrl });

          set({ isLoading: false });
          return urlData.publicUrl;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      deleteExerciseCover: async (coverUrl: string) => {
        set({ isLoading: true, error: null });
        try {
          const urlParts = coverUrl.split('/');
          const filePath = `exercises/${urlParts[urlParts.length - 1]}`;

          const { error } = await supabase.storage
            .from('exercises')
            .remove([filePath]);

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Local state actions
      setWorkouts: (workouts) => {
        set({ workouts, error: null });
      },

      addWorkout: (workout) => {
        set((state) => ({
          workouts: [...state.workouts, workout],
        }));
      },

      updateWorkout: (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id === id ? { ...workout, ...updates } : workout
          ),
          selectedWorkout:
            state.selectedWorkout?.id === id
              ? { ...state.selectedWorkout, ...updates }
              : state.selectedWorkout,
        }));
      },

      deleteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.filter((workout) => workout.id !== id),
          selectedWorkout:
            state.selectedWorkout?.id === id ? null : state.selectedWorkout,
        }));
      },

      selectWorkout: (workout) => {
        set({ selectedWorkout: workout });
      },

      getWorkoutById: (id) => {
        return get().workouts.find((workout) => workout.id === id);
      },

      addExerciseToWorkout: (workoutId, exercise) => {
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id === workoutId
              ? {
                ...workout,
                exercises: [...(workout.exercises || []), exercise],
              }
              : workout
          ),
        }));
      },

      updateExercise: (exerciseId, updates) => {
        set((state) => ({
          workouts: state.workouts.map((workout) => ({
            ...workout,
            exercises: workout.exercises?.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, ...updates }
                : exercise
            ),
          })),
        }));
      },

      deleteExercise: (exerciseId) => {
        set((state) => ({
          workouts: state.workouts.map((workout) => ({
            ...workout,
            exercises: workout.exercises?.filter(
              (exercise) => exercise.id !== exerciseId
            ),
          })),
        }));
      },

      getExercisesByWorkoutId: (workoutId) => {
        const workout = get().workouts.find((w) => w.id === workoutId);
        return workout?.exercises || [];
      },

      clearWorkouts: () => {
        set({ workouts: [], selectedWorkout: null, error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "workouts-state",
      storage: createJSONStorage(() => ({
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        getItem: (key: string) => SecureStore.getItemAsync(key),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      })),
    }
  )
);