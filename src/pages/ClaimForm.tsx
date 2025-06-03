import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { createClaim, validateTransactionHash } from '../lib/api'
import { isValidTxHash, isValidEmail } from '../lib/utils'

export function ClaimForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    sourceHash: '',
    destinationHash: '',
    explanation: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.destinationHash.trim()) {
      newErrors.destinationHash = 'Destination transaction hash is required'
    } else if (!isValidTxHash(formData.destinationHash)) {
      newErrors.destinationHash = 'Invalid transaction hash format'
    }

    if (formData.sourceHash && !isValidTxHash(formData.sourceHash)) {
      newErrors.sourceHash = 'Invalid transaction hash format'
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Explanation is required'
    } else if (formData.explanation.trim().length < 50) {
      newErrors.explanation = 'Explanation must be at least 50 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Validate destination transaction hash timestamp
      const validation = await validateTransactionHash(formData.destinationHash)
      
      if (!validation.valid) {
        setErrors({
          destinationHash: validation.error || 'Transaction hash validation failed'
        })
        return
      }

      // Create the claim
      const claim = await createClaim({
        sourceHash: formData.sourceHash || undefined,
        destinationHash: formData.destinationHash,
        explanation: formData.explanation,
        email: formData.email,
      })

      // Navigate to consent step
      navigate(`/bond-consent/${claim.id}`)
    } catch (error) {
      console.error('Failed to create claim:', error)
      setErrors({
        general: 'Failed to submit claim. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
            Submit Slashing Claim
          </h1>
          <p className="text-gray-600">
            Step 1 of 3: Provide details about the slashing claim
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="destinationHash" className="block text-sm font-medium text-gray-700 mb-2">
              Destination Transaction Hash *
            </label>
            <input
              type="text"
              id="destinationHash"
              value={formData.destinationHash}
              onChange={(e) => handleInputChange('destinationHash', e.target.value)}
              placeholder="0x..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                errors.destinationHash ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.destinationHash && (
              <p className="mt-1 text-sm text-red-600">{errors.destinationHash}</p>
            )}
          </div>

          <div>
            <label htmlFor="sourceHash" className="block text-sm font-medium text-gray-700 mb-2">
              Source Transaction Hash (Optional)
            </label>
            <input
              type="text"
              id="sourceHash"
              value={formData.sourceHash}
              onChange={(e) => handleInputChange('sourceHash', e.target.value)}
              placeholder="0x..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                errors.sourceHash ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.sourceHash && (
              <p className="mt-1 text-sm text-red-600">{errors.sourceHash}</p>
            )}
          </div>

          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
              Explanation *
            </label>
            <textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Provide a detailed explanation of the slashing claim..."
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.explanation ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between">
              {errors.explanation && (
                <p className="text-sm text-red-600">{errors.explanation}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.explanation.length} characters (minimum 50)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Validating...' : 'Continue to Bonding'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The destination transaction must have occurred within the last 14 days</li>
                <li>You will be required to bond 0.1 ETH to proceed with this claim</li>
                <li>All claim details will be publicly visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 