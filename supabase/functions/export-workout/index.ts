// supabase/functions/export-workout/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get workout_id from request (optional - export specific workout or all)
    const { workout_id } = await req.json().catch(() => ({}))

    let workoutsQuery = supabaseClient
      .from('workouts')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // If specific workout_id provided, filter by it
    if (workout_id) {
      workoutsQuery = workoutsQuery.eq('id', workout_id)
    }

    const { data: workouts, error: workoutsError } = await workoutsQuery

    if (workoutsError) throw workoutsError

    if (!workouts || workouts.length === 0) {
      throw new Error('No workouts found')
    }

    // Create export data structure
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      total_workouts: workouts.length,
      total_exercises: workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),
      workouts: workouts.map(workout => ({
        id: workout.id,
        name: workout.name,
        cover: workout.cover,
        created_at: workout.created_at,
        exercises_count: workout.exercises?.length || 0,
        exercises: workout.exercises || []
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const fileName = workout_id
      ? `workout-${workout_id}-export-${Date.now()}.json`
      : `workouts-export-${user.id}-${Date.now()}.json`

    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('exports')
      .upload(fileName, jsonContent, {
        contentType: 'application/json',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get signed URL (valid for 7 days)
    const { data: urlData } = await supabaseClient
      .storage
      .from('exports')
      .createSignedUrl(fileName, 60 * 60 * 24 * 7)

    return new Response(
      JSON.stringify({
        success: true,
        file_path: uploadData.path,
        download_url: urlData?.signedUrl,
        total_workouts: workouts.length,
        total_exercises: exportData.total_exercises,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})