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

    const {
      quiz_id,
      title,
      term_id,
      questions,
    }: {
      quiz_id: string
      title: string
      term_id: string | null
      questions: Array<{
        id?: string
        text: string
        score: number
        options: Array<{
          id?: string
          text: string
          is_correct: boolean
        }>
      }>
    } = await req.json()

    if (!quiz_id || !title) {
      return new Response(
        JSON.stringify({ error: 'quiz_id ve title zorunludur.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Quiz güncelle
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({ title, term_id })
      .eq('id', quiz_id)

    if (quizError) throw quizError

    // Mevcut soruları al
    const { data: existingQuestions, error: existingError } = await supabase
      .from('questions')
      .select('id')
      .eq('quiz_id', quiz_id)

    if (existingError) throw existingError

    const existingQuestionIds = existingQuestions?.map((q) => q.id) ?? []

    // Güncelleme için yeni ve güncel soruların id'leri
    const incomingQuestionIds = questions
      .filter((q) => q.id)
      .map((q) => q.id!)

    // Silinecek sorular
    const toDeleteQuestions = existingQuestionIds.filter(
      (id) => !incomingQuestionIds.includes(id)
    )

    // Silme işlemi (soru ve ona bağlı seçenekler)
    for (const qId of toDeleteQuestions) {
      await supabase.from('options').delete().eq('question_id', qId)
      await supabase.from('questions').delete().eq('id', qId)
    }

    // Soruları insert/update et
    for (const q of questions) {
      let questionId = q.id

      if (questionId) {
        // Güncelle
        const { error: qUpdateErr } = await supabase
          .from('questions')
          .update({ text: q.text, score: q.score })
          .eq('id', questionId)
        if (qUpdateErr) throw qUpdateErr
      } else {
        // Yeni soru ekle
        const { data: newQuestion, error: qInsertErr } = await supabase
          .from('questions')
          .insert([{ quiz_id, text: q.text, score: q.score }])
          .select()
          .single()
        if (qInsertErr) throw qInsertErr
        questionId = newQuestion.id
      }

      // Mevcut seçenekleri al
      const { data: existingOptions, error: existingOptsErr } = await supabase
        .from('options')
        .select('id')
        .eq('question_id', questionId)
      if (existingOptsErr) throw existingOptsErr

      const existingOptionIds = existingOptions?.map((o) => o.id) ?? []

      const incomingOptionIds = q.options.filter((o) => o.id).map((o) => o.id!)

      // Silinecek seçenekler
      const toDeleteOptions = existingOptionIds.filter(
        (id) => !incomingOptionIds.includes(id)
      )

      for (const optId of toDeleteOptions) {
        await supabase.from('options').delete().eq('id', optId)
      }

      // Seçenekleri insert/update et
      for (const opt of q.options) {
        if (opt.id) {
          // Güncelle
          const { error: optUpdateErr } = await supabase
            .from('options')
            .update({ text: opt.text, is_correct: opt.is_correct })
            .eq('id', opt.id)
          if (optUpdateErr) throw optUpdateErr
        } else {
          // Yeni seçenek ekle
          await supabase.from('options').insert([
            {
              question_id: questionId,
              text: opt.text,
              is_correct: opt.is_correct,
            },
          ])
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Quiz güncellendi.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Bilinmeyen hata' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
