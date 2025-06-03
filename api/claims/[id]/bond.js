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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  try {
    if (req.method === 'POST') {
      const { bondTxHash, userAddress } = req.body

      if (!bondTxHash || !userAddress) {
        return res.status(400).json({ 
          error: 'Missing required fields: bondTxHash, userAddress' 
        })
      }

      const claim = await prisma.claim.update({
        where: { id },
        data: {
          bonded: true,
          bondTxHash,
          userAddress,
          status: 'Under Review'
        }
      })

      return res.json(claim)
    }

    res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 