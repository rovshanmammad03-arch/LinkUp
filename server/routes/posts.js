import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/posts
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('posts').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/posts
router.post('/', requireAuth, async (req, res) => {
  const { caption, type, image } = req.body
  if (!caption) return res.status(400).json({ error: 'Caption required' })

  const { data, error } = await supabase.from('posts').insert({
    author_id: req.user.id, caption, type: type || 'other',
    image: image || '', likes: [], comments: []
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/posts/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('posts').select('author_id').eq('id', req.params.id).single()
  if (!post || post.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  const { caption, type } = req.body
  const { data, error } = await supabase.from('posts')
    .update({ caption, type }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('posts').select('author_id').eq('id', req.params.id).single()
  if (!post || post.author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })

  await supabase.from('posts').delete().eq('id', req.params.id)
  res.json({ success: true })
})

// POST /api/posts/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('posts').select('likes,author_id').eq('id', req.params.id).single()
  if (!post) return res.status(404).json({ error: 'Not found' })

  const likes = post.likes || []
  const liked = likes.includes(req.user.id)
  const newLikes = liked ? likes.filter(x => x !== req.user.id) : [...likes, req.user.id]

  const { data, error } = await supabase.from('posts')
    .update({ likes: newLikes }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/posts/:id/comment
router.post('/:id/comment', requireAuth, async (req, res) => {
  const { text, parent_id } = req.body
  if (!text) return res.status(400).json({ error: 'Text required' })

  const { data: post } = await supabase.from('posts').select('comments,author_id').eq('id', req.params.id).single()
  if (!post) return res.status(404).json({ error: 'Not found' })

  const comment = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,5),
    user_id: req.user.id, text, ts: Date.now(),
    parent_id: parent_id || null
  }
  const newComments = [...(post.comments || []), comment]

  const { data, error } = await supabase.from('posts')
    .update({ comments: newComments }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })

  // Notification
  const targetId = parent_id
    ? (post.comments || []).find(c => c.id === parent_id)?.user_id
    : post.author_id
  if (targetId && targetId !== req.user.id) {
    const { data: me } = await supabase.from('users').select('name').eq('id', req.user.id).single()
    await supabase.from('notifications').insert({
      user_id: targetId, type: 'comment',
      text: me.name + (parent_id ? ' şərhinə cavab verdi' : ' postuna şərh yazdı') + ': "' + text.slice(0,40) + '"',
      from_id: req.user.id, read: false
    })
  }

  res.json(data)
})

// DELETE /api/posts/:id/comment/:commentId
router.delete('/:id/comment/:commentId', requireAuth, async (req, res) => {
  const { data: post } = await supabase.from('posts').select('comments').eq('id', req.params.id).single()
  if (!post) return res.status(404).json({ error: 'Not found' })

  const newComments = (post.comments || []).filter(c => c.id !== req.params.commentId)
  const { data, error } = await supabase.from('posts')
    .update({ comments: newComments }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
