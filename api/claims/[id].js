import { PrismaClient } from '@prisma/client'

let prisma

// Initialize Prisma client (with connection pooling for serverless)
if (!global.__prisma) {
  global.__prisma = new PrismaClient()
}
prisma = global.__prisma

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  try {
    if (req.method === 'GET') {
      const claim = await prisma.claim.findUnique({
        where: { id }
      })
      
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' })
      }
      
      return res.json(claim)
    }

    res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 