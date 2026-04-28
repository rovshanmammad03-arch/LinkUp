import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/messages — all conversations for current user
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('messages')
    .select('*')
    .or(`from_id.eq.${req.user.id},to_id.eq.${req.user.id}`)
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/messages
router.post('/', requireAuth, async (req, res) => {
  const { to_id, text } = req.body
  if (!to_id || !text) return res.status(400).json({ error: 'Missing fields' })

  const { data, error } = await supabase.from('messages').insert({
    from_id: req.user.id, to_id, text, read: false
  }).select().single()
  if (error) return res.status(500).json({ error: error.message })

  // Notification
  const { data: me } = await supabase.from('users').select('name').eq('id', req.user.id).single()
  await supabase.from('notifications').insert({
    user_id: to_id, type: 'message',
    text: me.name + ' sənə mesaj göndərdi',
    from_id: req.user.id, read: false
  })

  res.json(data)
})

// PATCH /api/messages/read/:fromId — mark messages from user as read
router.patch('/read/:fromId', requireAuth, async (req, res) => {
  await supabase.from('messages')
    .update({ read: true })
    .eq('from_id', req.params.fromId)
    .eq('to_id', req.user.id)
  res.json({ success: true })
})

export default router
