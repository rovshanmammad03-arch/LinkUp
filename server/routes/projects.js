import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const GRADIENTS = [
  'from-brand-500 to-purple-500','from-cyan-500 to-green-500',
  'from-amber-500 to-rose-500','from-pink-500 to-brand-500',
  'from-green-500 to-cyan-500','from-purple-500 to-pink-500'
]

// GET /api/projects
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('projects')
    .select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/projects
router.post('/', requireAuth, async (req, res) => {
  const { title, desc, skills, team, status } = req.body
  if (!title || !desc) return res.status(400).json({ error: 'Missing fields' })

  const grad = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
  const { data, error } = await supabase.from('projects').insert({
    title, desc, author_id: req.user.id,
    skills: skills || [], team: team || '3-5 nəfər',
    status: status || 'active', applicants: [], grad
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/projects/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const { data: proj } = await supabase.from('projects').select('author_id').eq('id', req.params.id).single()
  if (!proj || proj.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { title, desc, skills, team, status } = req.body
  const { data, error } = await supabase.from('projects')
    .update({ title, desc, skills, team, status }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: proj } = await supabase.from('projects').select('author_id').eq('id', req.params.id).single()
  if (!proj || proj.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  await supabase.from('projects').delete().eq('id', req.params.id)
  res.json({ success: true })
})

// POST /api/projects/:id/apply
router.post('/:id/apply', requireAuth, async (req, res) => {
  const { msg } = req.body
  const { data: proj } = await supabase.from('projects').select('*').eq('id', req.params.id).single()
  if (!proj) return res.status(404).json({ error: 'Not found' })

  const applicants = proj.applicants || []
  if (applicants.find(a => a.user_id === req.user.id))
    return res.status(409).json({ error: 'Already applied' })

  applicants.push({ user_id: req.user.id, msg: msg || '', ts: Date.now() })
  const { data, error } = await supabase.from('projects')
    .update({ applicants }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })

  const { data: me } = await supabase.from('users').select('name').eq('id', req.user.id).single()
  await supabase.from('notifications').insert({
    user_id: proj.author_id, type: 'project_apply',
    text: me.name + ' "' + proj.title + '" layihəsinə müraciət etdi.',
    from_id: req.user.id, read: false, project_id: proj.id
  })

  res.json(data)
})

export default router
