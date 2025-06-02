import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Mail, FileText, Users, Calendar, Clock, Target, Award, Upload, X, Download, Trash2, Edit2, Eye } from 'lucide-react'
import { dataApi } from '../../services/api'

const DataPage = () => {
  const [timeRange, setTimeRange] = useState('30d')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dataApi.getFiles()
      setFiles(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching files')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    emailsSent: 247,
    templatesUsed: 42,
    successRate: 98.5,
    avgResponseTime: '2.3h',
    totalRecipients: 156,
    activeTemplates: 12
  }

  const chartData = [
    { period: 'Week 1', sent: 45, opened: 38, clicked: 12 },
    { period: 'Week 2', sent: 52, opened: 44, clicked: 18 },
    { period: 'Week 3', sent: 38, opened: 32, clicked: 14 },
    { period: 'Week 4', sent: 67, opened: 58, clicked: 22 },
  ]

  const topTemplates = [
    { name: 'Project Update', uses: 31, rate: 94.2 },
    { name: 'Follow-up Email', uses: 23, rate: 87.6 },
    { name: 'Custom Email', uses: 15, rate: 91.3 },
    { name: 'Thank You Note', uses: 12, rate: 96.8 },
    { name: 'Meeting Invitation', uses: 8, rate: 88.9 }
  ]

  const recentActivity = [
    { action: 'Email sent', target: 'john@example.com', time: '2 minutes ago', status: 'delivered' },
    { action: 'Template used', target: 'Project Update', time: '15 minutes ago', status: 'success' },
    { action: 'Email opened', target: 'sarah@company.com', time: '1 hour ago', status: 'opened' },
    { action: 'New template created', target: 'Newsletter Template', time: '3 hours ago', status: 'created' },
    { action: 'Email clicked', target: 'team@startup.io', time: '5 hours ago', status: 'clicked' }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <Mail className="text-blue-400" size={16} />
      case 'opened':
        return <TrendingUp className="text-green-400" size={16} />
      case 'clicked':
        return <Target className="text-purple-400" size={16} />
      case 'created':
        return <FileText className="text-yellow-400" size={16} />
      default:
        return <Award className="text-gray-400" size={16} />
    }
  }

  const handleFileUpload = async (event) => {
    try {
      setLoading(true)
      setError(null)
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      await dataApi.uploadFile(formData)
      await fetchFiles()
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        setLoading(true)
        setError(null)
        await dataApi.uploadFile(formData)
        await fetchFiles()
      } catch (error) {
        setError(error.response?.data?.message || 'Error uploading file')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePreview = async (fileId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await dataApi.getPreview(fileId)
      setPreviewData(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Error loading preview')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        setLoading(true)
        setError(null)
        await dataApi.deleteFile(fileId)
        setFiles(files.filter(f => f._id !== fileId))
        if (previewData && previewData.fileId === fileId) {
          setPreviewData(null)
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting file')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">Data Files</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
            <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Upload File</h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                loading ? 'border-[#FF9B45] bg-[#FF9B45]/5' : 'border-[#521C0D]/20 hover:border-[#FF9B45]/50 hover:bg-[#FF9B45]/5'
              } transition-all duration-200`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <Upload className="mx-auto text-[#521C0D]/40" size={48} />
                <div>
                  <p className="text-[#521C0D] text-lg mb-2">
                    Drop your CSV or Excel file here
                  </p>
                  <p className="text-[#521C0D]/60 text-sm">
                    or click to browse
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="px-6 py-3 bg-[#FF9B45] text-white rounded-xl hover:bg-[#D5451B] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Select File'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
            <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Your Files</h3>
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="bg-white rounded-xl p-4 border border-[#521C0D]/10 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[#521C0D]" size={24} />
                      <div>
                        <h4 className="font-medium text-[#521C0D]">{file.originalName}</h4>
                        <p className="text-sm text-[#521C0D]/60">
                          {file.rowCount} rows • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(file._id)}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <Eye className="text-[#521C0D]" size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(file._id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {file.columns.map((column, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#F4E7E1] rounded-lg text-xs text-[#521C0D]/80"
                      >
                        {column}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {files.length === 0 && !loading && (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-[#521C0D]/40 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-[#521C0D]/80 mb-2">No files uploaded</h3>
                  <p className="text-[#521C0D]/60">
                    Upload a CSV or Excel file to get started
                  </p>
                </div>
              )}

              {loading && !previewData && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5451B]"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
          <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Data Preview</h3>
          {previewData ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#521C0D]/10">
                      {previewData.columns.map((column, index) => (
                        <th key={index} className="pb-2 text-left text-[#521C0D]/80 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#521C0D]/10 last:border-0">
                        {previewData.columns.map((column, colIndex) => (
                          <td key={colIndex} className="py-2 text-[#521C0D]">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-[#521C0D]/60 text-sm">
                Showing {previewData.preview.length} of {previewData.totalRows} rows
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="mx-auto text-[#521C0D]/40 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-[#521C0D]/80 mb-2">No preview selected</h3>
              <p className="text-[#521C0D]/60">
                Click the preview icon on a file to view its contents
              </p>
            </div>
          )}

          {loading && previewData && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5451B]"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Email Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="7d" className="bg-gray-800">Last 7 days</option>
          <option value="30d" className="bg-gray-800">Last 30 days</option>
          <option value="90d" className="bg-gray-800">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Emails Sent</p>
              <p className="text-3xl font-bold text-white">{stats.emailsSent}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Mail className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            +12% from last month
          </div>
        </div>

        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Templates Used</p>
              <p className="text-3xl font-bold text-white">{stats.templatesUsed}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <FileText className="text-green-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            +8% from last month
          </div>
        </div>

        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Target className="text-purple-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            +2.1% from last month
          </div>
        </div>

        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-white">{stats.avgResponseTime}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            15min faster
          </div>
        </div>

        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Total Recipients</p>
              <p className="text-3xl font-bold text-white">{stats.totalRecipients}</p>
            </div>
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <Users className="text-pink-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            +23 new contacts
          </div>
        </div>

        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Active Templates</p>
              <p className="text-3xl font-bold text-white">{stats.activeTemplates}</p>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Award className="text-indigo-400" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            +3 this month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileText size={20} />
            Top Templates
          </h3>
          <div className="space-y-4">
            {topTemplates.map((template, index) => (
              <div key={template.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{template.name}</p>
                    <p className="text-white/60 text-sm">{template.uses} uses</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{template.rate}%</p>
                  <p className="text-white/60 text-sm">success</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock size={20} />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="p-2 bg-white/10 rounded-lg">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-white/70"> • {activity.target}</span>
                  </p>
                  <p className="text-white/60 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="glass backdrop-blur-lg rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} />
          Email Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {chartData.map((data, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-t from-purple-500/20 to-purple-500/5 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-white">{data.sent}</div>
                <div className="text-white/60 text-xs">Sent</div>
              </div>
              <div className="text-white/70 text-sm">{data.period}</div>
            </div>
          ))}
        </div>
        <div className="h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  )
}

export default DataPage