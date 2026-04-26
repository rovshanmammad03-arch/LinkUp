import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../supabase.js'

const router = Router()

const GRADIENTS = [
  'from-brand-500 to-purple-500','from-cyan-500 to-green-500',
  'from-amber-500 to-rose-500','from-pink-500 to-brand-500',
  'from-green-500 to-cyan-500','from-purple-500 to-pink-500',
  'from-teal-500 to-brand-500','from-rose-500 to-amber-500',
  'from-brand-600 to-cyan-500'
]

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, university, field, level } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })

  const { data: existing } = await supabase
    .from('users').select('id').eq('email', email).single()
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const hash = await bcrypt.hash(password, 10)
  const grad = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]

  const { data: user, error } = await supabase.from('users').insert({
    email, password: hash, name,
    university: university || '',
    field: field || '',
    level: level || 'Başlanğıc',
    bio: '', skills: [], links: [], avatar: '',
    views: 0, onboarding_done: false,
    followers: [], following: [], grad
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: sanitize(user) })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  const { data: user } = await supabase
    .from('users').select('*').eq('email', email).single()
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: sanitize(user) })
})

function sanitize(u) {
  const { password, ...rest } = u
  return rest
}

export default router
