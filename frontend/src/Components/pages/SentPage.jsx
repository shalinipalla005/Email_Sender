import { useState, useEffect } from 'react'
import { Mail, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { emailApi } from '../../services/api'

const SentPage = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalEmails: 0,
    successCount: 0,
    failureCount: 0,
    pendingCount: 0
  })

  useEffect(() => {
    fetchEmails()
    fetchStats()
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

  const fetchStats = async () => {
    try {
      const response = await emailApi.getStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching email stats:', error)
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">Sent Emails</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#521C0D]/60 text-sm">Total Emails</p>
              <h3 className="text-2xl font-bold text-[#521C0D]">{stats.totalEmails}</h3>
            </div>
            <Mail className="text-[#521C0D]/40" size={32} />
          </div>
        </div>
        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#521C0D]/60 text-sm">Delivered</p>
              <h3 className="text-2xl font-bold text-green-500">{stats.successCount}</h3>
            </div>
            <CheckCircle className="text-green-500/40" size={32} />
          </div>
        </div>
        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#521C0D]/60 text-sm">Failed</p>
              <h3 className="text-2xl font-bold text-red-500">{stats.failureCount}</h3>
            </div>
            <XCircle className="text-red-500/40" size={32} />
          </div>
        </div>
        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#521C0D]/60 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-[#FF9B45]">{stats.pendingCount}</h3>
            </div>
            <Clock className="text-[#FF9B45]/40" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#521C0D]/10">
                <th className="pb-4 text-left text-[#521C0D]/80 font-medium">Subject</th>
                <th className="pb-4 text-left text-[#521C0D]/80 font-medium">Template</th>
                <th className="pb-4 text-left text-[#521C0D]/80 font-medium">Recipients</th>
                <th className="pb-4 text-left text-[#521C0D]/80 font-medium">Status</th>
                <th className="pb-4 text-left text-[#521C0D]/80 font-medium">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email._id} className="border-b border-[#521C0D]/10 last:border-0">
                  <td className="py-4 text-[#521C0D]">{email.subject}</td>
                  <td className="py-4">
                    {email.template ? (
                      <div className="flex items-center gap-2 text-[#521C0D]">
                        <FileText size={16} />
                        <span>{email.template.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#521C0D]/60">Custom</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="text-[#521C0D]">
                      {email.successCount + email.failureCount}/{email.totalRecipients}
                    </div>
                    <div className="text-xs text-[#521C0D]/60">
                      {email.successCount} delivered, {email.failureCount} failed
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(email.status)}
                      <span className={getStatusColor(email.status)}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-[#521C0D]/60">
                    {new Date(email.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {emails.length === 0 && !loading && (
          <div className="text-center py-12">
            <Mail className="mx-auto text-[#521C0D]/40 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-[#521C0D]/80 mb-2">No emails sent yet</h3>
            <p className="text-[#521C0D]/60">
              Start by creating a template or sending a new email
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5451B]"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentPage