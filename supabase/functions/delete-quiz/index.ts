import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { quiz_id } = await req.json()

    if (!quiz_id) {
      return new Response(
        JSON.stringify({ error: 'quiz_id zorunludur.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // İlgili soruları al
    const { data: questions, error: questionsErr } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', quiz_id)

    if (questionsErr) throw questionsErr

    const questionIds = questions?.map((q) => q.id) ?? []

    // Her soru için options'ları sil
    for (const qId of questionIds) {
      await supabase.from('options').delete().eq('question_id', qId)
    }

    // Soruları sil
    if (questionIds.length > 0) {
      await supabase.from('questions').delete().in('id', questionIds)
    }

    // Quiz'i sil
    const { error: quizDeleteErr } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quiz_id)

    if (quizDeleteErr) throw quizDeleteErr

    return new Response(
      JSON.stringify({ success: true, message: 'Quiz silindi.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  }  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})