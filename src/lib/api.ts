export interface Claim {
  id: string
  sourceHash?: string
  destinationHash: string
  explanation: string
  email: string
  submittedAt: string
  status: 'Pending' | 'Under Review' | 'Won' | 'Rejected' | 'Refunded'
  bonded: boolean
  userAddress?: string
  bondTxHash?: string
}

export interface CreateClaimData {
  sourceHash?: string
  destinationHash: string
  explanation: string
  email: string
}

// API Base URL - will be configurable
const API_BASE = '/api'

export async function createClaim(data: CreateClaimData): Promise<Claim> {
  const response = await fetch(`${API_BASE}/claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create claim')
  }
  
  return response.json()
}

export async function getClaims(): Promise<Claim[]> {
  const response = await fetch(`${API_BASE}/claims`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch claims')
  }
  
  return response.json()
}

export async function getClaim(id: string): Promise<Claim> {
  const response = await fetch(`${API_BASE}/claims/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch claim')
  }
  
  return response.json()
}

export async function validateTransactionHash(hash: string): Promise<{ valid: boolean; timestamp?: number; error?: string }> {
  const response = await fetch(`${API_BASE}/validate-hash?hash=${hash}`)
  
  if (!response.ok) {
    throw new Error('Failed to validate transaction hash')
  }
  
  return response.json()
}

export async function updateClaimBondStatus(claimId: string, bondTxHash: string, userAddress: string): Promise<Claim> {
  const response = await fetch(`${API_BASE}/claims/${claimId}/bond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bondTxHash, userAddress }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update bond status')
  }
  
  return response.json()
} 