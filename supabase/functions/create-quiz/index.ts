import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // service role key ile yazma yetkisi
    )

    const { title, term_id } = await req.json()

    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Geçerli bir başlık gerekli.' }), {
        status: 400,
      })
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert([{ title, term_id }])
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, quiz: data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
