import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Save, Eye, ArrowLeft, HelpCircle, Plus, Bold, Italic, List, Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { templateApi } from '../../services/api'

const CreateTemplatePage = ({ onPreview }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const editingTemplate = location.state?.template

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    category: 'General',
    content: '',
    variables: [
      { name: 'name', description: 'Recipient\'s name' },
      { name: 'email', description: 'Recipient\'s email address' },
      { name: 'company', description: 'Recipient\'s company name' },
      { name: 'role', description: 'Recipient\'s job role' }
    ]
  })

  const [showVariableHelp, setShowVariableHelp] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [sampleData, setSampleData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    role: 'Product Manager'
  })

  const categories = ['General', 'Business', 'Personal']

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        description: editingTemplate.description,
        subject: editingTemplate.subject,
        category: editingTemplate.category,
        content: editingTemplate.content,
        variables: editingTemplate.variables
      })
      setSampleData(editingTemplate.sampleData)
    }
  }, [editingTemplate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSampleDataChange = (e) => {
    const { name, value } = e.target
    setSampleData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddVariable = () => {
    const variableName = prompt('Enter variable name (without curly braces):')
    if (variableName) {
      const description = prompt('Enter variable description:')
      if (description) {
        setFormData(prev => ({
          ...prev,
          variables: [...prev.variables, { name: variableName, description }]
        }))
        setSampleData(prev => ({
          ...prev,
          [variableName]: 'Sample ' + variableName
        }))
      }
    }
  }

  const handleRemoveVariable = (index) => {
    const variable = formData.variables[index]
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
    const newSampleData = { ...sampleData }
    delete newSampleData[variable.name]
    setSampleData(newSampleData)
  }

  const insertVariable = (variableName) => {
    const textarea = document.getElementById('content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = `${before}{{${variableName}}}${after}`
    
    setFormData(prev => ({
      ...prev,
      content: newText
    }))
  }

  const insertFormatting = (format) => {
    const textarea = document.getElementById('content')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)
    let newText = text

    switch (format) {
      case 'bold':
        newText = text.substring(0, start) + `<b>${selectedText}</b>` + text.substring(end)
        break
      case 'italic':
        newText = text.substring(0, start) + `<i>${selectedText}</i>` + text.substring(end)
        break
      case 'list':
        newText = text.substring(0, start) + `\n• ${selectedText}` + text.substring(end)
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) {
          newText = text.substring(0, start) + `<a href="${url}">${selectedText || url}</a>` + text.substring(end)
        }
        break
      case 'align-left':
        newText = text.substring(0, start) + `<div style="text-align: left">${selectedText}</div>` + text.substring(end)
        break
      case 'align-center':
        newText = text.substring(0, start) + `<div style="text-align: center">${selectedText}</div>` + text.substring(end)
        break
      case 'align-right':
        newText = text.substring(0, start) + `<div style="text-align: right">${selectedText}</div>` + text.substring(end)
        break
    }

    setFormData(prev => ({
      ...prev,
      content: newText
    }))
  }

  const getPreviewContent = () => {
    let content = formData.content
    let subject = formData.subject
    formData.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable.name}}}`, 'g')
      content = content.replace(regex, sampleData[variable.name] || `[${variable.name}]`)
      subject = subject.replace(regex, sampleData[variable.name] || `[${variable.name}]`)
    })
    return { content, subject }
  }

  const handlePreview = () => {
    if (!formData.content) return

    onPreview({
      open: true,
      content: {
        subject: formData.name,
        body: formData.content,
        recipient: 'preview@example.com',
        totalRecipients: 1
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const templateData = {
        templateName: formData.name,
        description: formData.description,
        category: formData.category,
        subject: formData.subject,
        content: formData.content,
        variables: formData.variables
      }

      if (editingTemplate) {
        await templateApi.update(editingTemplate._id, templateData)
      } else {
        await templateApi.create(templateData)
      }

      navigate('/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      setError(error.response?.data?.message || 'Error saving template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="text-[#521C0D]" size={24} />
          </button>
          <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </h2>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            previewMode
              ? 'bg-[#FF9B45] text-[#F4E7E1] border border-[#FF9B45]'
              : 'bg-[#F4E7E1] text-[#521C0D] hover:bg-[#FF9B45]/10 border border-[#FF9B45]/30'
          }`}
        >
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-[#521C0D]/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#521C0D] mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Welcome Email"
                    className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-[#521C0D] mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent transition-all duration-200"
                    required
                    disabled={loading}
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-[#F4E7E1]">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#521C0D] mb-2">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the template"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#521C0D] mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter email subject line"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>

              {!previewMode ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="content" className="block text-sm font-medium text-[#521C0D]">
                      Template Content
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => insertFormatting('bold')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Bold"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('italic')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Italic"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('list')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Add List Item"
                      >
                        <List size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('link')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Insert Link"
                      >
                        <Link size={16} />
                      </button>
                      <div className="w-px h-6 bg-[#FF9B45]/20 mx-2" />
                      <button
                        type="button"
                        onClick={() => insertFormatting('align-left')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Align Left"
                      >
                        <AlignLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('align-center')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Align Center"
                      >
                        <AlignCenter size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('align-right')}
                        className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors text-[#521C0D]/60 hover:text-[#521C0D]"
                        title="Align Right"
                      >
                        <AlignRight size={16} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    placeholder="Type your email template here..."
                    className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent transition-all duration-200 resize-none font-mono"
                    required
                    disabled={loading}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#521C0D]">
                      Preview
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowVariableHelp(!showVariableHelp)}
                      className="text-[#521C0D]/60 hover:text-[#521C0D] transition-colors"
                    >
                      <HelpCircle size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="w-full px-4 py-3 bg-white rounded-xl text-[#521C0D] border border-[#521C0D]/10">
                      <h4 className="font-medium mb-1">Subject:</h4>
                      <div dangerouslySetInnerHTML={{ __html: getPreviewContent().subject }} />
                    </div>
                    <div className="w-full min-h-[300px] px-4 py-3 bg-white rounded-xl text-[#521C0D] overflow-y-auto border border-[#521C0D]/10">
                      <h4 className="font-medium mb-2">Content:</h4>
                      <div dangerouslySetInnerHTML={{ __html: getPreviewContent().content }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    loading
                      ? 'bg-[#521C0D]/20 text-[#521C0D]/40 cursor-not-allowed'
                      : 'bg-[#D5451B] text-white hover:bg-[#521C0D]'
                  }`}
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#521C0D]/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#521C0D]">Template Variables</h3>
              <button
                onClick={handleAddVariable}
                className="flex items-center gap-2 px-3 py-1 bg-[#FF9B45] text-white rounded-lg hover:bg-[#D5451B] transition-all duration-200"
              >
                <Plus size={16} />
                Add Variable
              </button>
            </div>
            <div className="space-y-3">
              {formData.variables.map((variable, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-[#FF9B45]/10 transition-colors group border border-[#521C0D]/10"
                >
                  <button
                    onClick={() => insertVariable(variable.name)}
                    className="flex-1 text-left"
                  >
                    <div className="text-[#521C0D] font-mono">{'{{' + variable.name + '}}'}</div>
                    <div className="text-[#521C0D]/60 text-sm">{variable.description}</div>
                  </button>
                  <button
                    onClick={() => handleRemoveVariable(index)}
                    className="opacity-0 group-hover:opacity-100 text-[#D5451B]/60 hover:text-[#D5451B] transition-all px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {previewMode && (
            <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#521C0D]/10">
              <h3 className="text-lg font-semibold text-[#521C0D] mb-4">Sample Data</h3>
              <div className="space-y-4">
                {Object.entries(sampleData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-[#521C0D] mb-2">
                      {key}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value}
                      onChange={handleSampleDataChange}
                      className="w-full px-3 py-2 bg-white border border-[#521C0D]/20 rounded-lg text-[#521C0D] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {showVariableHelp && (
            <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#521C0D]/10">
              <h3 className="text-lg font-semibold text-[#521C0D] mb-4">How to Use Variables</h3>
              <div className="space-y-4 text-[#521C0D]/80 text-sm">
                <p>
                  Variables allow you to personalize your emails with recipient-specific data from your CSV/Excel file.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">To use variables:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[#521C0D]/70">
                    <li>Click on a variable from the list to insert it</li>
                    <li>Variables will be replaced with actual data when sending emails</li>
                    <li>Make sure your CSV/Excel columns match the variable names</li>
                  </ol>
                </div>
                <p className="text-[#521C0D]/60 italic">
                  Example: "Hello {{name}}" becomes "Hello John" when sent
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTemplatePage 