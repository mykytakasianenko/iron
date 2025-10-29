import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate time range (past 24 hours)
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Count workouts created in the past 24 hours
    const { count: workoutCount, error: workoutError } = await supabaseClient
      .from('workouts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', now.toISOString())

    if (workoutError) throw workoutError

    // Count exercises created in the past 24 hours
    const { count: exerciseCount, error: exerciseError } = await supabaseClient
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', now.toISOString())

    if (exerciseError) throw exerciseError

    console.log(`Daily Workout Report:`)
    console.log(`- ${workoutCount} workouts created in the past 24 hours`)
    console.log(`- ${exerciseCount} exercises created in the past 24 hours`)

    // Insert into daily_reports table
    const { error: insertError } = await supabaseClient
      .from('daily_reports')
      .insert({
        report_date: now.toISOString().split('T')[0], // YYYY-MM-DD
        workouts_created: workoutCount || 0,
        exercises_created: exerciseCount || 0,
        created_at: now.toISOString(),
      })

    if (insertError) {
      console.error('Error inserting into daily_reports:', insertError)
      // Don't throw - still want to return success if count worked
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: now.toISOString(),
        workouts_created: workoutCount || 0,
        exercises_created: exerciseCount || 0,
        message: `Daily report: ${workoutCount || 0} workouts, ${exerciseCount || 0} exercises`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Cron function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})