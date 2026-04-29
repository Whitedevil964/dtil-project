import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcyfhxcjvzqyvgiivqcx.supabase.co'
const supabaseKey = 'sb_publishable_-uYa98qIHc9lh6A5EtEDHg_m3pqCYNQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing connection...')
  const { data, error } = await supabase.from('messages').select('*').limit(1)
  if (error) {
    console.error('❌ Select failed:', error.message)
  } else {
    console.log('✅ Select successful!')
  }

  console.log('Testing Insert...')
  const { error: insError } = await supabase.from('messages').insert({
    sender_id: 'test_system',
    sender_name: 'Test Bot',
    content: 'Verification message'
  })

  if (insError) {
    console.error('❌ Insert failed:', insError.message)
    console.error('Full insert error:', insError)
  } else {
    console.log('✅ Insert successful!')
  }
}

test()
