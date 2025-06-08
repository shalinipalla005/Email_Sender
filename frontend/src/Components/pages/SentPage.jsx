import { useState, useEffect } from 'react'
import { Mail, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { emailApi } from '../../services/api'

const SentPage = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedEmail, setExpandedEmail] = useState(null)

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await emailApi.getSent()
      setEmails(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching sent emails')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      case 'processing':
        return 'text-[#FF9B45]'
      default:
        return 'text-[#521C0D]/60'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />
      case 'failed':
        return <XCircle size={20} className="text-red-500" />
      case 'processing':
        return <Clock size={20} className="text-[#FF9B45]" />
      default:
        return <Clock size={20} className="text-[#521C0D]/60" />
    }
  }

  const getRecipientStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#521C0D]">Sent Emails</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5451B]"></div>
        </div>
      ) : emails.length > 0 ? (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-[#F4E7E1]/20 transition-colors"
                onClick={() => setExpandedEmail(expandedEmail === email._id ? null : email._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#FF9B45]/10 rounded-lg">
                      <Mail className="text-[#FF9B45]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#521C0D]">{email.subject}</h3>
                      <div className="flex items-center space-x-2 text-sm text-[#521C0D]/60">
                        <Users size={16} />
                        <span>{email.recipientCount} recipients</span>
                        <span>•</span>
                        <span>{new Date(email.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-1 ${getStatusColor(email.status)}`}>
                      {getStatusIcon(email.status)}
                      <span className="text-sm capitalize">{email.status}</span>
                    </div>
                    {expandedEmail === email._id ? (
                      <ChevronUp className="text-[#521C0D]/60" size={20} />
                    ) : (
                      <ChevronDown className="text-[#521C0D]/60" size={20} />
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient Details Section */}
              {expandedEmail === email._id && (
                <div className="border-t border-[#521C0D]/10 p-4 bg-[#F4E7E1]/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-[#521C0D]">Recipient Details</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Sent: {email.stats.sent}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>Failed: {email.stats.failed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {email.recipients.map((recipient, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg ${getRecipientStatusColor(recipient.status)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{recipient.name}</p>
                              <p className="text-sm opacity-75">{recipient.email}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                              {recipient.status}
                            </span>
                          </div>
                          {recipient.error && (
                            <p className="text-sm mt-2 text-red-600">
                              Error: {recipient.error}
                            </p>
                          )}
                          {Object.keys(recipient.customFields).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-black/10">
                              <p className="text-xs font-medium mb-1">Custom Fields:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(recipient.customFields).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Mail className="mx-auto text-[#521C0D]/40 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-[#521C0D]/80 mb-2">No emails sent yet</h3>
          <p className="text-[#521C0D]/60">
            Start by creating and sending an email campaign
          </p>
        </div>
      )}
    </div>
  )
}

export default SentPage