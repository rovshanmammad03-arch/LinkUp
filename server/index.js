import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import messageRoutes from './routes/messages.js'
import notifRoutes from './routes/notifications.js'
import projectRoutes from './routes/projects.js'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' })) // 10mb for base64 images

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notifRoutes)
app.use('/api/projects', projectRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`LinkUp API running on http://localhost:${PORT}`))
