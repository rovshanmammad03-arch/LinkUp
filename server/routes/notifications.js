import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('notifications')
    .select('*').eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req, res) => {
  await supabase.from('notifications')
    .update({ read: true }).eq('user_id', req.user.id)
  res.json({ success: true })
})

export default router
