import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, HelpCircle } from 'lucide-react'
import { getClaims, type Claim } from '../lib/api'
import { formatDate, formatTxHash, getStatusColor } from '../lib/utils'

export function HomePage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClaims() {
      try {
        const data = await getClaims()
        setClaims(data)
      } catch (err) {
        setError('Failed to fetch claims')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Slashing Claim Portal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Submit and track slashing claims for staking violations. 
          All claims require a 0.001 ETH bond and are publicly visible.
        </p>
      </div>

      {/* Main CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/new"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Initiate Claim
        </Link>
        <Link 
          to="/faq"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          View FAQ
        </Link>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">All Claims</h2>
          <p className="text-sm text-gray-600 mt-1">
            Public record of all submitted slashing claims
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading claims...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No claims submitted yet.</p>
            <Link 
              to="/new" 
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              Be the first to submit a claim →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(claim.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {claim.sourceHash ? (
                        <a 
                          href={`https://sepolia.arbiscan.io/tx/${claim.sourceHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono"
                        >
                          {formatTxHash(claim.sourceHash)}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`https://sepolia.arbiscan.io/tx/${claim.destinationHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {formatTxHash(claim.destinationHash)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 