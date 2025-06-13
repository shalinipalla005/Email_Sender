import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Copy, FileText, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { templateApi } from '../../services/api'

const TemplatesPage = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const categories = ['All', 'General', 'Business', 'Personal']

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      let response
      if (selectedCategory === 'All') {
        response = await templateApi.getAll()
      } else {
        response = await templateApi.getByCategory(selectedCategory)
      }
      if (response.data.success && Array.isArray(response.data.data)) {
        setTemplates(response.data.data)
      } else {
        setTemplates([])
        setError('Invalid response format from server')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setError(error.response?.data?.message || 'Error fetching templates')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = (template) => {
    navigate('/draft', { state: { template } })
  }

  const handleEditTemplate = (template) => {
    navigate('/templates/create', { state: { template } })
  }

  const handleDeleteTemplate = async (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        setLoading(true)
        setError(null)
        await templateApi.delete(templateId)
        setTemplates(templates.filter(t => t._id !== templateId))
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting template')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCopyTemplate = async (template) => {
    try {
      setLoading(true)
      setError(null)
      const newTemplate = {
        name: `${template.name} (Copy)`,
        description: template.description,
        subject: template.subject || '',
        content: template.content,
        category: template.category,
        variables: template.variables || []
      }
      const response = await templateApi.create(newTemplate)
      setTemplates([response.data, ...templates])
      alert('Template copied successfully!')
    } catch (error) {
      setError(error.response?.data?.message || 'Error copying template')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'General':
        return 'bg-[#FF9B45]/20 text-[#D5451B] border-[#FF9B45]/30'
      case 'Business':
        return 'bg-[#D5451B]/20 text-[#D5451B] border-[#D5451B]/30'
      case 'Personal':
        return 'bg-[#521C0D]/20 text-[#521C0D] border-[#521C0D]/30'
      default:
        return 'bg-[#521C0D]/20 text-[#521C0D] border-[#521C0D]/30'
    }
  }

  const truncateText = (text, maxLength = 60) => {
    if (!text) return 'No subject'
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const stripHtmlTags = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">Email Templates</h2>
        <button 
          onClick={() => navigate('/templates/create')}
          className="flex items-center gap-2 px-6 py-3 bg-[#D5451B] text-white rounded-xl hover:bg-[#521C0D] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          disabled={loading}
        >
          <Plus size={20} />
          New Template
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-[#FF9B45] text-white border border-[#FF9B45]'
                : 'bg-[#F4E7E1] text-[#521C0D] hover:bg-[#FF9B45]/10 border border-[#FF9B45]/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-[#521C0D]/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#521C0D] mb-2">{template.name}</h3>
                <p className="text-[#521C0D]/70 text-sm mb-3">{template.description}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs border ${getCategoryColor(template.category)}`}>
                  {template.category}
                </div>
              </div>
              <Mail className="text-[#521C0D]/60 group-hover:text-[#521C0D] transition-colors" size={24} />
            </div>

            {template.subject && (
              <div className="mb-3">
                <div className="bg-[#FF9B45]/10 rounded-lg p-3 border border-[#FF9B45]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={14} className="text-[#D5451B]" />
                    <span className="text-xs font-medium text-[#D5451B]">Subject:</span>
                  </div>
                  <p className="text-[#521C0D] text-sm font-medium">
                    {truncateText(template.subject, 50)}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="bg-white rounded-lg p-3 max-h-20 overflow-hidden border border-[#521C0D]/10">
                <p className="text-[#521C0D]/80 text-sm line-clamp-3">
                  {stripHtmlTags(template.content)}
                </p>
              </div>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div className="mb-3">
                <div className="bg-[#521C0D]/10 rounded-lg px-3 py-2 border border-[#521C0D]/20">
                  <p className="text-xs text-[#521C0D]/70">
                    <span className="font-medium">{template.variables.length}</span> variables: {' '}
                    {template.variables.slice(0, 3).map(v => `{{${v.name}}}`).join(', ')}
                    {template.variables.length > 3 && '...'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#521C0D]/60 mb-4">
              <span>Used {template.useCount || 0} times</span>
              <span>{new Date(template.lastUsed || template.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUseTemplate(template)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D5451B] text-white rounded-lg hover:bg-[#521C0D] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                Use
              </button>
              <button
                onClick={() => handleEditTemplate(template)}
                disabled={loading}
                className="px-3 py-2 bg-[#FF9B45] text-white rounded-lg hover:bg-[#D5451B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleCopyTemplate(template)}
                disabled={loading}
                className="px-3 py-2 bg-[#FF9B45] text-white rounded-lg hover:bg-[#D5451B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => handleDeleteTemplate(template._id)}
                disabled={loading}
                className="px-3 py-2 bg-red-500/20 border border-red-400/30 text-red-500 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-12 text-center border border-[#521C0D]/10">
          <Mail className="mx-auto text-[#521C0D]/40 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-[#521C0D]/80 mb-2">No templates found</h3>
          <p className="text-[#521C0D]/60">
            {selectedCategory === 'All' 
              ? 'Create your first email template to get started' 
              : `No templates found in "${selectedCategory}" category`
            }
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D5451B]"></div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPage