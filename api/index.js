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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { url, method } = req
  const pathname = new URL(url, `http://${req.headers.host}`).pathname

  try {
    // Health check
    if (pathname === '/api/health') {
      return res.json({ status: 'OK', timestamp: new Date().toISOString() })
    }

    // Get all claims
    if (pathname === '/api/claims' && method === 'GET') {
      const claims = await prisma.claim.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return res.json(claims)
    }

    // Create new claim
    if (pathname === '/api/claims' && method === 'POST') {
      const { sourceHash, destinationHash, explanation, email } = req.body

      if (!destinationHash || !explanation || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields: destinationHash, explanation, email' 
        })
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

    // Get specific claim
    if (pathname.startsWith('/api/claims/') && !pathname.includes('/bond') && method === 'GET') {
      const id = pathname.split('/')[3]
      const claim = await prisma.claim.findUnique({
        where: { id }
      })
      
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' })
      }
      
      return res.json(claim)
    }

    // Validate transaction hash
    if (pathname === '/api/validate-hash' && method === 'GET') {
      const { searchParams } = new URL(url, `http://${req.headers.host}`)
      const hash = searchParams.get('hash')
      
      if (!hash) {
        return res.status(400).json({ error: 'Transaction hash is required' })
      }

      const validation = await validateTransactionHash(hash)
      return res.json(validation)
    }

    // Update claim bond status
    if (pathname.includes('/bond') && method === 'POST') {
      const id = pathname.split('/')[3]
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

    // Route not found
    return res.status(404).json({ error: 'API route not found' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 