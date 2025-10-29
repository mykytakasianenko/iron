import { useState } from 'react';
import { supabase } from '../lib/supabase'; // Your supabase client

export const useWorkoutExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportWorkouts = async (workoutId?: number) => {
    try {
      setIsExporting(true);
      setExportError(null);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('export-workout', {
        body: workoutId ? { workout_id: workoutId } : {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return {
        success: true,
        downloadUrl: data.download_url,
        totalWorkouts: data.total_workouts,
        totalExercises: data.total_exercises,
        filePath: data.file_path,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export workouts';
      setExportError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsExporting(false);
    }
  };

  return { exportWorkouts, isExporting, exportError };
};
