import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { getClaim, type Claim } from '../lib/api'
import { BOND_AMOUNT } from '../lib/wagmi'

export function BondConsent() {
  const { claimId } = useParams<{ claimId: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClaim() {
      if (!claimId) {
        setError('No claim ID provided')
        setLoading(false)
        return
      }

      try {
        const data = await getClaim(claimId)
        setClaim(data)
      } catch (err) {
        setError('Failed to fetch claim details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClaim()
  }, [claimId])

  const handleProceed = () => {
    if (claim) {
      navigate(`/bond/${claim.id}`)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claim details...</p>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Claim not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bonding Consent
          </h1>
          <p className="text-gray-600">
            Step 2 of 3: Confirm your willingness to bond ETH
          </p>
        </div>

        {/* Claim Summary */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Claim Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Destination Hash:</span>
              <span className="font-mono text-gray-900 truncate ml-2">
                {claim.destinationHash}
              </span>
            </div>
            {claim.sourceHash && (
              <div className="flex justify-between">
                <span className="text-gray-600">Source Hash:</span>
                <span className="font-mono text-gray-900 truncate ml-2">
                  {claim.sourceHash}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{claim.email}</span>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Notice
              </h3>
              <p className="text-yellow-700 mb-4">
                You are about to bond <strong>{BOND_AMOUNT} ETH</strong> to proceed with this slashing claim.
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <p><strong>• Bond Requirements:</strong> You must send exactly {BOND_AMOUNT} ETH to continue</p>
                <p><strong>• Risk Warning:</strong> Your bond may be forfeited if the claim is deemed invalid</p>
                <p><strong>• Public Record:</strong> This claim will be publicly visible on the portal</p>
                <p><strong>• Review Process:</strong> Claims are manually reviewed by the Security Council</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Question */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Do you wish to continue with bonding {BOND_AMOUNT} ETH?
          </h2>
          <p className="text-gray-600">
            By proceeding, you acknowledge the risks and agree to bond the required amount.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={handleProceed}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yes, Continue to Bonding
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            Questions about the bonding process? Check our{' '}
            <button
              onClick={() => navigate('/faq')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              FAQ section
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 