import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock function to validate transaction hash (replace with real implementation)
async function validateTransactionHash(hash) {
  // For now, just return true for valid-looking hashes
  // In production, this would call Etherscan API or RPC to check:
  // 1. Transaction exists
  // 2. Transaction timestamp is within last 14 days
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash format' }
  }

  // Mock validation - always passes for now
  const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000)
  return { 
    valid: true, 
    timestamp: Date.now() - (Math.random() * 10 * 24 * 60 * 60 * 1000) // Random time within last 10 days
  }
}

// Routes

// Get all claims
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(claims)
  } catch (error) {
    console.error('Error fetching claims:', error)
    res.status(500).json({ error: 'Failed to fetch claims' })
  }
})

// Get specific claim
app.get('/api/claims/:id', async (req, res) => {
  try {
    const { id } = req.params
    const claim = await prisma.claim.findUnique({
      where: { id }
    })
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' })
    }
    
    res.json(claim)
  } catch (error) {
    console.error('Error fetching claim:', error)
    res.status(500).json({ error: 'Failed to fetch claim' })
  }
})

// Create new claim
app.post('/api/claims', async (req, res) => {
  try {
    const { sourceHash, destinationHash, explanation, email } = req.body

    // Validate required fields
    if (!destinationHash || !explanation || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: destinationHash, explanation, email' 
      })
    }

    // Create claim
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

    res.status(201).json(claim)
  } catch (error) {
    console.error('Error creating claim:', error)
    res.status(500).json({ error: 'Failed to create claim' })
  }
})

// Validate transaction hash
app.get('/api/validate-hash', async (req, res) => {
  try {
    const { hash } = req.query
    
    if (!hash) {
      return res.status(400).json({ error: 'Transaction hash is required' })
    }

    const validation = await validateTransactionHash(hash)
    res.json(validation)
  } catch (error) {
    console.error('Error validating hash:', error)
    res.status(500).json({ error: 'Failed to validate transaction hash' })
  }
})

// Update claim bond status
app.post('/api/claims/:id/bond', async (req, res) => {
  try {
    const { id } = req.params
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

    res.json(claim)
  } catch (error) {
    console.error('Error updating bond status:', error)
    res.status(500).json({ error: 'Failed to update bond status' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('👋 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
}) 