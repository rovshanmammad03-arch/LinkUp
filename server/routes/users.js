import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/users — all users except self
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('users').select('id,name,email,university,field,level,bio,avatar,grad,skills,links,views,followers,following,onboarding_done,created_at')
    .neq('id', req.user.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('users').select('id,name,email,university,field,level,bio,avatar,grad,skills,links,views,followers,following,onboarding_done,created_at')
    .eq('id', req.user.id).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/users/:id
router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('users').select('id,name,email,university,field,level,bio,avatar,grad,skills,links,views,followers,following,created_at')
    .eq('id', req.params.id).single()
  if (error) return res.status(404).json({ error: 'User not found' })
  // increment views
  await supabase.from('users').update({ views: (data.views || 0) + 1 }).eq('id', req.params.id)
  res.json(data)
})

// PATCH /api/users/me — update profile
router.patch('/me', requireAuth, async (req, res) => {
  const allowed = ['name','university','field','level','bio','avatar','skills','links','onboarding_done']
  const updates = {}
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  const { data, error } = await supabase
    .from('users').update(updates).eq('id', req.user.id)
    .select('id,name,email,university,field,level,bio,avatar,grad,skills,links,views,followers,following,onboarding_done').single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/users/:id/follow
router.post('/:id/follow', requireAuth, async (req, res) => {
  const targetId = req.params.id
  const myId = req.user.id
  if (targetId === myId) return res.status(400).json({ error: 'Cannot follow yourself' })

  const [{ data: me }, { data: target }] = await Promise.all([
    supabase.from('users').select('following').eq('id', myId).single(),
    supabase.from('users').select('followers').eq('id', targetId).single()
  ])

  const myFollowing = me.following || []
  const theirFollowers = target.followers || []
  const isFollowing = myFollowing.includes(targetId)

  const newMyFollowing = isFollowing ? myFollowing.filter(x => x !== targetId) : [...myFollowing, targetId]
  const newTheirFollowers = isFollowing ? theirFollowers.filter(x => x !== myId) : [...theirFollowers, myId]

  await Promise.all([
    supabase.from('users').update({ following: newMyFollowing }).eq('id', myId),
    supabase.from('users').update({ followers: newTheirFollowers }).eq('id', targetId)
  ])

  if (!isFollowing) {
    const { data: meUser } = await supabase.from('users').select('name').eq('id', myId).single()
    await supabase.from('notifications').insert({
      user_id: targetId, type: 'follow',
      text: meUser.name + ' səni izləməyə başladı',
      from_id: myId, read: false
    })
  }

  res.json({ following: !isFollowing })
})

export default router
