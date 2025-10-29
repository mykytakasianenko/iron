import React from 'react';
import { Alert, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native';
import { useWorkoutExport } from '../hooks/useWorkoutExport';

interface ExportWorkoutsButtonProps {
  workoutId?: number; // Optional: export single workout
  style?: any;
}

export const ExportWorkoutsButton: React.FC<ExportWorkoutsButtonProps> = ({
  workoutId,
  style
}) => {
  const { exportWorkouts, isExporting, exportError } = useWorkoutExport();

  const handleExport = async () => {
    const result = await exportWorkouts(workoutId);

    if (result.success && result.downloadUrl) {
      Alert.alert(
        'Export Successful',
        workoutId
          ? `Exported workout with ${result.totalExercises} exercises. Download now?`
          : `Exported ${result.totalWorkouts} workouts with ${result.totalExercises} exercises. Download now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: () => Linking.openURL(result.downloadUrl),
          },
        ]
      );
    } else {
      Alert.alert('Export Failed', result.error || 'Unknown error');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleExport}
      disabled={isExporting}
      style={[
        {
          backgroundColor: isExporting ? '#ccc' : '#007AFF',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {isExporting ? (
        <>
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Exporting...</Text>
        </>
      ) : (
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {workoutId ? 'Export This Workout' : 'Export All Workouts'}
        </Text>
      )}
    </TouchableOpacity>
  );
};