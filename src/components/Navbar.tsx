import { Link } from 'react-router-dom'
import { DynamicWidget } from '@dynamic-labs/sdk-react-core'

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Slashing Portal
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/new" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                New Claim
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <DynamicWidget />
          </div>
        </div>
      </div>
    </nav>
  )
} 