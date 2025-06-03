import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is a slashing claim?",
    answer: "A slashing claim is a formal accusation that a validator has violated network rules or behaved maliciously. These claims are used to protect the network by allowing community members to report and potentially penalize bad actors."
  },
  {
    question: "Why do I need to bond 0.1 ETH?",
    answer: "The 0.1 ETH bond (testing amount) ensures that claim submissions are serious and prevents spam. This bond demonstrates your commitment to the validity of your claim and helps filter out frivolous accusations."
  },
  {
    question: "What happens to my bond?",
    answer: "If your claim is deemed valid and approved, you will receive your bond back plus any rewards. If the claim is rejected as invalid or frivolous, you may forfeit some or all of your bond."
  },
  {
    question: "How long does the review process take?",
    answer: "Claims are reviewed by the Security Council within 7-14 business days. Complex cases may take longer. You will be notified via email when your claim status changes."
  },
  {
    question: "What evidence should I provide?",
    answer: "Provide as much detail as possible in your explanation, including transaction hashes, timestamps, and a clear description of the alleged violation. The more evidence you provide, the better your claim can be evaluated."
  },
  {
    question: "Why is the 14-day limit important?",
    answer: "The 14-day limit ensures that claims are made promptly after incidents occur, when evidence is fresh and can be properly verified. This helps maintain the integrity of the claims process."
  },
  {
    question: "Can I cancel my claim after submitting?",
    answer: "Once a bond transaction is confirmed, claims cannot be cancelled. However, you can contact the Security Council with additional information or concerns about your claim."
  },
  {
    question: "What types of violations can be reported?",
    answer: "Common violations include double signing, slashable attestations, equivocation, and other behaviors that violate network consensus rules. If you're unsure whether something qualifies, provide details in your claim explanation."
  },
  {
    question: "Is my personal information kept private?",
    answer: "Your email address is kept private and only used for communication about your claim. However, transaction details and your explanation will be publicly visible on the portal."
  },
  {
    question: "What if I need help with the process?",
    answer: "If you encounter technical issues or need clarification about the claims process, you can reach out to the Security Council through the official communication channels."
  }
]

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about submitting slashing claims
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="divide-y divide-gray-200">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index)
            
            return (
              <div key={index} className="p-6">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-md p-2 -m-2"
                >
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="mt-4 pr-8">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ready to Submit a Claim?
        </h2>
        <p className="text-gray-600 mb-6">
          If you've identified a validator violation, start the claims process now.
        </p>
        <Link
          to="/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Initiate Claim
        </Link>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need More Help?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            For technical support or complex questions about the claims process, 
            contact the Security Council directly.
          </p>
          <div className="text-sm text-gray-500">
            Response time: 1-2 business days
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Important Reminders
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Claims must be submitted within 14 days</li>
            <li>• Bond amount is exactly 0.1 ETH (testing)</li>
            <li>• All claims are publicly visible</li>
            <li>• False claims may result in bond forfeiture</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 