import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle, Wallet, ExternalLink } from 'lucide-react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { arbitrumSepolia } from 'wagmi/chains'
import { getClaim, updateClaimBondStatus, type Claim } from '../lib/api'
import { BOND_CONTRACT_ADDRESS, BOND_AMOUNT } from '../lib/wagmi'
import { formatTxHash } from '../lib/utils'

export function BondFlow() {
  const { claimId } = useParams<{ claimId: string }>()
  const navigate = useNavigate()
  const { setShowAuthFlow } = useDynamicContext()
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bondingStatus, setBondingStatus] = useState<'idle' | 'pending' | 'confirming' | 'completed' | 'failed'>('idle')

  const { 
    sendTransaction, 
    data: txHash, 
    isPending: isTxPending,
    error: txError 
  } = useSendTransaction()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

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
        
        if (data.bonded) {
          setBondingStatus('completed')
        }
      } catch (err) {
        setError('Failed to fetch claim details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClaim()
  }, [claimId])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash && claim && address) {
      updateBondStatus()
    }
  }, [isConfirmed, txHash, claim, address])

  // Update bonding status
  useEffect(() => {
    if (isTxPending) {
      setBondingStatus('pending')
    } else if (isConfirming) {
      setBondingStatus('confirming')
    } else if (isConfirmed) {
      setBondingStatus('completed')
    } else if (txError || receiptError) {
      setBondingStatus('failed')
    }
  }, [isTxPending, isConfirming, isConfirmed, txError, receiptError])

  const updateBondStatus = async () => {
    if (!claim || !txHash || !address) return

    try {
      await updateClaimBondStatus(claim.id, txHash, address)
      // Redirect to home after successful bonding
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      console.error('Failed to update bond status:', err)
      setError('Failed to update claim status')
    }
  }

  const handleConnectWallet = () => {
    setShowAuthFlow(true)
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: arbitrumSepolia.id })
    } catch (err) {
      console.error('Failed to switch network:', err)
    }
  }

  const handleSendBond = async () => {
    if (!claim) return

    // Check if user is on correct network
    if (chain?.id !== arbitrumSepolia.id) {
      setError('Please switch to Arbitrum Sepolia network first')
      return
    }

    try {
      await sendTransaction({
        to: BOND_CONTRACT_ADDRESS,
        value: parseEther(BOND_AMOUNT),
        gas: 100000n, // 100k gas limit - more than enough for simple ETH transfer
        gasPrice: undefined, // Let the network determine gas price
      })
    } catch (err) {
      console.error('Transaction failed:', err)
      setBondingStatus('failed')
    }
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
          onClick={() => navigate(`/bond-consent/${claim.id}`)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Consent
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bond Transaction
          </h1>
          <p className="text-gray-600">
            Step 3 of 3: Connect wallet and send bond
          </p>
        </div>

        {/* Claim Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Final Claim Summary</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600 block">Destination Hash:</span>
              <span className="font-mono text-gray-900 break-all">
                {claim.destinationHash}
              </span>
            </div>
            {claim.sourceHash && (
              <div>
                <span className="text-gray-600 block">Source Hash:</span>
                <span className="font-mono text-gray-900 break-all">
                  {claim.sourceHash}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600 block">Explanation:</span>
              <p className="text-gray-900 mt-1">{claim.explanation}</p>
            </div>
            <div>
              <span className="text-gray-600 block">Email:</span>
              <span className="text-gray-900">{claim.email}</span>
            </div>
          </div>
        </div>

        {/* Bond Amount Reminder */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Bond Amount: {BOND_AMOUNT} ETH
            </h3>
            <p className="text-blue-700 text-sm">
              This amount will be sent to the bonding contract
            </p>
          </div>
        </div>

        {/* Wallet Connection & Transaction */}
        {!isConnected ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your wallet to proceed with the bond transaction
            </p>
            <button
              onClick={handleConnectWallet}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : bondingStatus === 'completed' ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bond Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your claim has been submitted and is now under review.
            </p>
            {txHash && (
              <div className="mb-4">
                <a
                  href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  View transaction <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                <p className="text-sm text-gray-500 mt-1 font-mono">
                  {formatTxHash(txHash)}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Connected wallet: <span className="font-mono text-gray-900">{address}</span>
              </p>
              <p className="text-gray-600 mb-4">
                Current network: <span className="font-mono text-gray-900">{chain?.name || 'Unknown'}</span>
              </p>
            </div>

            {/* Wrong Network Warning */}
            {chain?.id !== arbitrumSepolia.id && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <p className="text-orange-700 font-medium">Wrong Network</p>
                      <p className="text-orange-600 text-sm">Please switch to Arbitrum Sepolia to continue</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSwitchNetwork}
                    className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Switch Network
                  </button>
                </div>
              </div>
            )}

            {bondingStatus === 'failed' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700">
                    Transaction failed. Please try again.
                  </p>
                </div>
                {txError && (
                  <p className="text-sm text-red-600 mt-2">
                    Error: {txError.message}
                  </p>
                )}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleSendBond}
                disabled={
                  bondingStatus === 'pending' || 
                  bondingStatus === 'confirming' ||
                  chain?.id !== arbitrumSepolia.id
                }
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {chain?.id !== arbitrumSepolia.id && 'Switch to Arbitrum Sepolia First'}
                {chain?.id === arbitrumSepolia.id && bondingStatus === 'pending' && 'Sending Transaction...'}
                {chain?.id === arbitrumSepolia.id && bondingStatus === 'confirming' && 'Confirming...'}
                {chain?.id === arbitrumSepolia.id && bondingStatus === 'idle' && `Send ${BOND_AMOUNT} ETH Bond`}
                {chain?.id === arbitrumSepolia.id && bondingStatus === 'failed' && 'Retry Transaction'}
              </button>
            </div>

            {(bondingStatus === 'pending' || bondingStatus === 'confirming') && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  {bondingStatus === 'pending' && 'Waiting for wallet confirmation...'}
                  {bondingStatus === 'confirming' && 'Waiting for blockchain confirmation...'}
                </p>
                {txHash && bondingStatus === 'confirming' && (
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    View on Arbiscan <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">
            Bond Contract: <span className="font-mono">{BOND_CONTRACT_ADDRESS}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Network: Arbitrum Sepolia (Chain ID: {arbitrumSepolia.id})
          </p>
        </div>
      </div>
    </div>
  )
} 