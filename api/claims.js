import { PrismaClient } from '@prisma/client'

let prisma

// Initialize Prisma client (with connection pooling for serverless)
if (!global.__prisma) {
  global.__prisma = new PrismaClient()
}
prisma = global.__prisma

// Mock function to validate transaction hash (replace with real implementation)
async function validateTransactionHash(hash) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash format' }
  }

  // Mock validation - always passes for now
  return { 
    valid: true, 
    timestamp: Date.now() - (Math.random() * 10 * 24 * 60 * 60 * 1000) // Random time within last 10 days
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Get all claims
    if (req.method === 'GET') {
      const claims = await prisma.claim.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.json(claims)
    }

    // Create new claim
    if (req.method === 'POST') {
      const { sourceHash, destinationHash, explanation, email } = req.body

      if (!destinationHash || !explanation || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields: destinationHash, explanation, email' 
        })
      }

      // Validate the destination hash
      const validation = await validateTransactionHash(destinationHash)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const claim = await prisma.claim.create({
        data: {
          sourceHash: sourceHash || null,
          destinationHash,
          explanation,
          email,
          status: 'Pending',
          bonded: false
        }
      })

      return res.status(201).json(claim)
    }

    res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 