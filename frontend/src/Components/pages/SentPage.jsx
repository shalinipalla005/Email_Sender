import { useState, useEffect } from 'react'
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import { emailApi } from '../../services/api'

const SentPage = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
            <div key={email._id} className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#FF9B45]/10 rounded-lg">
                    <Mail className="text-[#FF9B45]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#521C0D]">{email.subject}</h3>
                    <p className="text-sm text-[#521C0D]/60">
                      To: {email.recipientCount} recipients
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getStatusColor(email.status)}`}>
                    {getStatusIcon(email.status)}
                    <span className="text-sm capitalize">{email.status}</span>
                  </div>
                  <span className="text-sm text-[#521C0D]/60">
                    {new Date(email.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
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