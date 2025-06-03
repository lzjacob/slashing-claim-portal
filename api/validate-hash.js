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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const { hash } = req.query
      
      if (!hash) {
        return res.status(400).json({ error: 'Transaction hash is required' })
      }

      const validation = await validateTransactionHash(hash)
      return res.json(validation)
    }

    res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 