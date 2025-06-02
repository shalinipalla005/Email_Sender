import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, Eye, Send } from 'lucide-react'
import { dataApi, emailApi, templateApi } from '../../services/api'

const DraftPage = ({ onPreview }) => {
  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [template, setTemplate] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    try {
      setLoading(true)
      setError(null)
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const response = await dataApi.uploadFile(formData)
      setFile(file)

      // Get file preview
      const preview = await dataApi.getPreview(response.data._id)
      setData(preview.data.preview)
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file')
      setFile(null)
      setData([])
    } finally {
      setLoading(false)
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
        const response = await dataApi.uploadFile(formData)
        setFile(file)

        // Get file preview
        const preview = await dataApi.getPreview(response.data._id)
        setData(preview.data.preview)
      } catch (error) {
        setError(error.response?.data?.message || 'Error uploading file')
        setFile(null)
        setData([])
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setData([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePreview = async () => {
    if (!data.length || !template) return

    try {
      const firstRow = data[0]
      const response = await emailApi.processTemplate({
        template,
        data: firstRow
      })

      onPreview({
        open: true,
        content: {
          subject: subject,
          body: response.data.content,
          recipient: firstRow.email || 'No email found',
          totalRecipients: data.length
        }
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing template')
    }
  }

  const handleSendEmails = async () => {
    if (!data.length || !template || !subject) return

    try {
      setLoading(true)
      setError(null)

      const recipients = data.map(row => row.email).filter(Boolean)
      await emailApi.send({
        subject,
        content: template,
        recipients
      })

      // Reset form
      setFile(null)
      setData([])
      setTemplate('')
      setSubject('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      alert('Emails are being sent!')
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending emails')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">New Email Draft</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
            <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Data File</h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                file ? 'border-[#FF9B45] bg-[#FF9B45]/5' : 'border-[#521C0D]/20 hover:border-[#FF9B45]/50 hover:bg-[#FF9B45]/5'
              } transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!file ? (
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
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-[#521C0D]" size={24} />
                    <div className="text-left">
                      <div className="text-[#521C0D] font-medium">{file.name}</div>
                      <div className="text-[#521C0D]/60 text-sm">
                        {data.length} records loaded
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <X className="text-[#521C0D]" size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {data.length > 0 && (
            <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
              <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#521C0D]/10">
                      {Object.keys(data[0]).map((header, index) => (
                        <th key={index} className="pb-2 text-left text-[#521C0D]/80 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#521C0D]/10 last:border-0">
                        {Object.values(row).map((cell, cellIndex) => (
                          <td key={cellIndex} className="py-2 text-[#521C0D]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 5 && (
                  <div className="mt-4 text-center text-[#521C0D]/60 text-sm">
                    Showing 5 of {data.length} rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
            <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Email Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  Email Template
                </label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Type your email template here. Use {{variable}} syntax for personalization."
                  rows={12}
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={handlePreview}
              disabled={!data.length || !template || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                !data.length || !template || loading
                  ? 'bg-[#521C0D]/20 text-[#521C0D]/40 cursor-not-allowed'
                  : 'bg-[#FF9B45] text-white hover:bg-[#D5451B]'
              }`}
            >
              <Eye size={20} />
              Preview First Email
            </button>
            <button
              onClick={handleSendEmails}
              disabled={!data.length || !template || !subject || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                !data.length || !template || !subject || loading
                  ? 'bg-[#521C0D]/20 text-[#521C0D]/40 cursor-not-allowed'
                  : 'bg-[#D5451B] text-white hover:bg-[#521C0D]'
              }`}
            >
              <Send size={20} />
              {loading ? 'Sending...' : 'Send Emails'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftPage