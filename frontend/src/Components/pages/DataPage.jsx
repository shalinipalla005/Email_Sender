import { useState, useEffect, useRef } from 'react'
import { Upload, X, Download, Trash2, Eye, FileText, Users, Clock } from 'lucide-react'
import { dataApi } from '../../services/api'

const DataPage = () => {
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

  const handleFileUpload = async (event) => {
    try {
      setLoading(true)
      setError(null)
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const response = await dataApi.uploadFile(formData)
      await fetchFiles()
      
      if (response.data.success) {
        setPreviewData({
          fileId: response.data.data._id,
          fields: response.data.data.fields,
          preview: response.data.data.preview
        })
      }
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
    if (file && file.type === 'text/csv') {
      const formData = new FormData()
      formData.append('file', file)
      try {
        setLoading(true)
        setError(null)
        const response = await dataApi.uploadFile(formData)
        await fetchFiles()
        
        if (response.data.success) {
          setPreviewData({
            fileId: response.data.data._id,
            fields: response.data.data.fields,
            preview: response.data.data.preview
          })
        }
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
      setPreviewData({
        fileId,
        fields: response.data.data.fields,
        preview: response.data.data.preview
      })
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#521C0D]">Data Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div 
        className="border-2 border-dashed border-[#521C0D]/20 rounded-2xl p-8 text-center cursor-pointer hover:border-[#521C0D]/40 transition-all duration-200"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <Upload className="mx-auto text-[#521C0D]/40" size={48} />
          <div>
            <p className="text-[#521C0D] text-lg mb-2">
              Drop your CSV file here
            </p>
            <p className="text-[#521C0D]/60 text-sm">
              or click to browse
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-6 py-3 bg-[#FF9B45] text-white rounded-xl hover:bg-[#D5451B] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Select File'}
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#521C0D]">Uploaded Files</h2>
          <div className="grid gap-4">
            {files.map(file => (
              <div key={file._id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#FF9B45]/10 rounded-lg">
                      <FileText className="text-[#FF9B45]" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#521C0D]">{file.originalName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-[#521C0D]/60">
                        <div className="flex items-center space-x-1">
                          <Users size={16} />
                          <span>{file.rowCount} contacts</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(file._id)}
                      className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="text-[#521C0D]" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="text-red-500" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#521C0D]">File Preview</h2>
            <button
              onClick={() => setPreviewData(null)}
              className="p-2 hover:bg-[#521C0D]/10 rounded-lg transition-colors duration-200"
            >
              <X className="text-[#521C0D]" size={20} />
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {previewData.fields.map(field => (
                    <th key={field} className="px-4 py-2 text-left text-[#521C0D] font-medium">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.preview.map((row, i) => (
                  <tr key={i} className="border-t border-[#521C0D]/10">
                    {previewData.fields.map(field => (
                      <td key={field} className="px-4 py-2 text-[#521C0D]/80">
                        {row[field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataPage