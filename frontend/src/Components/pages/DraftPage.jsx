import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, Eye, Send, Users, Mail, AlertCircle, CheckCircle, Download, Zap, Clock, Target, Settings } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Papa from 'papaparse'
import { emailApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// Email Preview Modal Component (keeping the existing one)
const EmailPreviewModal = ({ isOpen, onClose, previewData, onSendEmail }) => {
  if (!isOpen || !previewData) return null

  const {
    subject,
    body,
    recipient,
    recipientName,
    totalRecipients,
    previewIndex,
    totalRows
  } = previewData

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        <div className="bg-gradient-to-r from-[#521C0D] to-[#D5451B] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail size={24} />
            <div>
              <h3 className="text-xl font-bold">Email Preview</h3>
              <p className="text-white/80 text-sm">
                Previewing email {previewIndex || 1} of {totalRows || 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#521C0D]">To:</span>
              <span className="text-gray-700">
                {recipientName && recipientName !== 'Unknown' 
                  ? `${recipientName} <${recipient}>` 
                  : recipient || 'No recipient email'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#521C0D]">Subject:</span>
              <span className="text-gray-700 font-medium">
                {subject || 'No subject'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-[#521C0D]">Campaign Size:</span>
              <span className="text-gray-700">
                {totalRecipients || 0} recipients
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            
            <div className="bg-gray-100 border-b border-gray-200 p-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>From:</strong> Your Name &lt;your.email@company.com&gt;</div>
                <div><strong>To:</strong> {recipientName && recipientName !== 'Unknown' 
                  ? `${recipientName} <${recipient}>` 
                  : recipient || 'No recipient'}</div>
                <div><strong>Subject:</strong> {subject || 'No subject'}</div>
                <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
              </div>
            </div>

            <div className="p-6 bg-white min-h-[300px]">
              {body ? (
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Mail size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No email content to preview</p>
                  <p className="text-sm">Please add content to your email template</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="text-sm text-gray-500 text-center">
                This is a preview of how your email will appear to recipients
              </div>
            </div>
          </div>

          {body && body.includes('{{') && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Template Variables Detected</span>
              </div>
              <p className="text-sm text-yellow-700">
                If you see {`{{variable}}`} text in the preview, it means those fields weren't found in your data. 
                Make sure your CSV contains columns matching your template variables.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Ready to send to <strong>{totalRecipients || 0} recipients</strong>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Close Preview
            </button>
            {onSendEmail && (
              <button
                onClick={() => {
                  onSendEmail()
                  onClose()
                }}
                className="px-6 py-2 bg-[#D5451B] text-white rounded-xl hover:bg-[#521C0D] transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                Send Campaign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DraftPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const selectedTemplate = location.state?.template

  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [template, setTemplate] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [availableFields, setAvailableFields] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [emailValidation, setEmailValidation] = useState({ valid: 0, invalid: 0 })
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [emailConfigs, setEmailConfigs] = useState([])
  const [selectedEmailConfig, setSelectedEmailConfig] = useState('')
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false)
  const [newEmailConfig, setNewEmailConfig] = useState({ senderEmail: '', appPassword: '' })
  const [configsLoading, setConfigsLoading] = useState(true)
  const fileInputRef = useRef(null)

  // Fetch email configurations on mount
  useEffect(() => {
    fetchEmailConfigs()
  }, [])

  const fetchEmailConfigs = async () => {
    try {
      setConfigsLoading(true)
      const response = await emailApi.getEmailConfigs()
      
      if (response.data && response.data.success) {
        setEmailConfigs(response.data.data || [])
        if (response.data.data && response.data.data.length > 0) {
          setSelectedEmailConfig(response.data.data[0].senderEmail)
        }
      } else {
        setEmailConfigs([])
      }
    } catch (error) {
      console.error('Error fetching email configs:', error)
      setEmailConfigs([])
      // Don't show error for empty configs, it's normal for new users
    } finally {
      setConfigsLoading(false)
    }
  }

  const handleAddEmailConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newEmailConfig.senderEmail || !newEmailConfig.appPassword) {
        setError('Please fill in all fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmailConfig.senderEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      const response = await emailApi.addEmailConfig(newEmailConfig);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add email configuration');
      }

      await fetchEmailConfigs();
      setShowEmailConfigModal(false);
      setNewEmailConfig({ senderEmail: '', appPassword: '' });
      setSuccess('Email configuration saved successfully! You can now send emails without re-entering credentials.');
      
      // Auto-select the newly added config
      setSelectedEmailConfig(newEmailConfig.senderEmail);
    } catch (error) {
      console.error('Add email config error:', error);
      setError(error.response?.data?.message || error.message || 'Error adding email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmailConfig = async (senderEmail) => {
    if (!window.confirm(`Are you sure you want to delete the configuration for ${senderEmail}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await emailApi.deleteEmailConfig(senderEmail);
      
      if (response.data.success) {
        await fetchEmailConfigs();
        setSuccess('Email configuration deleted successfully');
        
        // If deleted config was selected, clear selection
        if (selectedEmailConfig === senderEmail) {
          setSelectedEmailConfig('');
        }
      }
    } catch (error) {
      console.error('Delete email config error:', error);
      setError(error.response?.data?.message || 'Error deleting email configuration');
    } finally {
      setLoading(false);
    }
  };

  // Initialize template data when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setTemplate(selectedTemplate.content)
      setSubject(selectedTemplate.subject)
    }
  }, [selectedTemplate])

  const validateEmails = (data) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    let valid = 0
    let invalid = 0
    
    data.forEach(row => {
      if (row.email && emailRegex.test(row.email)) {
        valid++
      } else {
        invalid++
      }
    })
    
    return { valid, invalid }
  }

  const validateTemplate = (template, availableFields) => {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const missingFields = []
    let match

    while ((match = variableRegex.exec(template)) !== null) {
      const field = match[1]
      if (!availableFields.includes(field)) {
        missingFields.push(field)
      }
    }

    return missingFields
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setFile(file)
    setError(null)
    setValidationErrors([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The file appears to be empty')
          return
        }

        const fields = Object.keys(results.data[0])
        if (!fields.includes('email')) {
          setError('The file must contain an "email" column')
          return
        }

        setData(results.data)
        setAvailableFields(fields)
        setEmailValidation(validateEmails(results.data))
      },
      error: (error) => {
        setError('Error parsing file: ' + error.message)
      }
    })
  }

  const handleRemoveFile = () => {
    setFile(null)
    setData([])
    setAvailableFields([])
    setEmailValidation({ valid: 0, invalid: 0 })
    setValidationErrors([])
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const insertField = (field) => {
    const templateField = `{{${field}}}`
    setTemplate(prev => prev + templateField)
  }

  const handlePreview = async () => {
    if (!data.length || !template) return

    const missingFields = validateTemplate(template, availableFields)
    if (missingFields.length > 0) {
      setError(`Template contains undefined fields: ${missingFields.join(', ')}`)
      return
    }

    try {
      const selectedRow = data[previewIndex]
      let processedTemplate = template
      let processedSubject = subject
      
      availableFields.forEach(field => {
        const regex = new RegExp(`\\{\\{${field}\\}\\}`, 'g')
        processedTemplate = processedTemplate.replace(regex, selectedRow[field] || `[${field}]`)
        processedSubject = processedSubject.replace(regex, selectedRow[field] || `[${field}]`)
      })

      if (!processedTemplate.trim()) {
        processedTemplate = 'No email content provided. Please add your email template.'
      }

      // Format the preview content with HTML
      processedTemplate = processEmailContent(processedTemplate)

      const previewContent = {
        subject: processedSubject,
        body: processedTemplate,
        recipient: selectedRow.email || 'No email found',
        recipientName: selectedRow.name || 'Unknown',
        totalRecipients: emailValidation.valid,
        previewIndex: previewIndex + 1,
        totalRows: data.length
      }

      setPreviewData(previewContent)
      setShowPreview(true)
    } catch (error) {
      console.error('Preview error:', error)
      setError('Error processing template')
    }
  }
  
  const processEmailContent = (content) => {
    // Convert line breaks to HTML
    let processedContent = content.replace(/\n/g, '<br>');
    
    // Add default styling
    processedContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${processedContent}
      </div>
    `;
    
    return processedContent;
  };

  const handleSendEmails = async () => {
    if (!data.length || !template || !subject || !selectedEmailConfig) {
      setError('Please fill in all required fields and select a sender email')
      return
    }
    
    const missingFields = validateTemplate(template, availableFields)
    if (missingFields.length > 0) {
      setError(`Template contains undefined fields: ${missingFields.join(', ')}`)
      return
    }

    if (emailValidation.valid === 0) {
      setError('No valid email addresses found')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Process each recipient with personalized content
      const processedRecipients = data
        .filter(row => row.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
        .map(row => {
          let processedSubject = subject
          let processedBody = template
          
          // Replace variables in both subject and body
          availableFields.forEach(field => {
            const regex = new RegExp(`\\{\\{${field}\\}\\}`, 'g')
            const value = row[field] || `[${field}]`
            processedSubject = processedSubject.replace(regex, value)
            processedBody = processedBody.replace(regex, value)
          })

          // Format the email body with HTML
          processedBody = processEmailContent(processedBody)

          // Prepare custom fields
          const customFields = {}
          Object.keys(row).forEach(key => {
            if (key !== 'name' && key !== 'email') {
              customFields[key] = String(row[key] || '')
            }
          })

          return {
            recipientName: row.name || row.email.split('@')[0],
            recipientEmail: row.email,
            personalizedSubject: processedSubject,
            personalizedBody: processedBody,
            customFields
          }
        })

      // Create email campaign with processed data
      const campaignData = {
        subject: subject,
        body: processEmailContent(template),
        senderEmail: selectedEmailConfig,
        recipientData: processedRecipients
      }

      console.log('Processed Campaign Data:', campaignData)

      // Create the campaign
      const createResponse = await emailApi.createCampaign(campaignData)
      
      if (!createResponse.data.success) {
        throw new Error(createResponse.data.message || 'Failed to create campaign')
      }

      const mailId = createResponse.data.mailId

      // Send the campaign
      const sendResponse = await emailApi.sendCampaign(mailId)
      
      if (!sendResponse.data.success) {
        throw new Error(sendResponse.data.message || 'Failed to send campaign')
      }

      // Reset form
      setFile(null)
      setData([])
      setTemplate('')
      setSubject('')
      setAvailableFields([])
      setEmailValidation({ valid: 0, invalid: 0 })
      setValidationErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setSuccess(`Campaign sent successfully to ${processedRecipients.length} recipients!`)
    } catch (error) {
      console.error('Email sending error:', error)
      setError(error.response?.data?.message || error.message || 'Error sending emails')
    } finally {
      setLoading(false)
    }
  }

  const downloadSampleFile = () => {
    const sampleData = 'name,email,company,position\nJohn Doe,john@example.com,Tech Corp,Developer\nJane Smith,jane@example.com,Design Co,Designer'
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_contacts.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="space-y-6">
      {/* Email Config Modal */}
      {showEmailConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#521C0D] mb-4">Add Email Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  Sender Email
                </label>
                <input
                  type="email"
                  value={newEmailConfig.senderEmail}
                  onChange={(e) => setNewEmailConfig(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder="Enter your Gmail address"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  App Password
                </label>
                <input
                  type="password"
                  value={newEmailConfig.appPassword}
                  onChange={(e) => setNewEmailConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                  placeholder="Enter 16-character app password"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                />
                <div className="text-xs text-[#521C0D]/60 mt-2 space-y-1">
                  <p>• Enable 2-factor authentication on your Gmail account</p>
                  <p>• Generate app password from Google Account Security settings</p>
                  <p>• Use the 16-character password (not your regular password)</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEmailConfigModal(false)
                  setNewEmailConfig({ senderEmail: '', appPassword: '' })
                }}
                className="flex-1 px-4 py-2 border border-[#521C0D]/20 text-[#521C0D] rounded-xl hover:bg-[#521C0D]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmailConfig}
                disabled={!newEmailConfig.senderEmail || !newEmailConfig.appPassword || loading}
                className="flex-1 px-4 py-2 bg-[#D5451B] text-white rounded-xl hover:bg-[#521C0D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <EmailPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        onSendEmail={handleSendEmails}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#521C0D] drop-shadow-lg">New Email Campaign</h2>
          <p className="text-[#521C0D]/70 mt-2">Send personalized emails to multiple recipients</p>
        </div>
        <button
          onClick={downloadSampleFile}
          className="flex items-center gap-2 px-4 py-2 bg-[#521C0D]/10 text-[#521C0D] rounded-xl hover:bg-[#521C0D]/20 transition-all duration-200"
        >
          <Download size={16} />
          Sample CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-200 rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={20} />
          <span className="flex-1">{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="p-1 hover:bg-green-200 rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} />
            <span className="font-medium">Validation Warnings:</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-gradient-to-r from-[#FF9B45]/10 to-[#D5451B]/10 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-[#521C0D] mb-1">
                <Users size={20} />
                <span className="text-2xl font-bold">{data.length}</span>
              </div>
              <p className="text-[#521C0D]/70 text-sm">Total Contacts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <CheckCircle size={20} />
                <span className="text-2xl font-bold">{emailValidation.valid}</span>
              </div>
              <p className="text-[#521C0D]/70 text-sm">Valid Emails</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                <AlertCircle size={20} />
                <span className="text-2xl font-bold">{emailValidation.invalid}</span>
              </div>
              <p className="text-[#521C0D]/70 text-sm">Invalid Emails</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        <div className="space-y-6">
          <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-[#521C0D]/10">
            <h3 className="text-lg font-semibold text-[#521C0D] mb-4 flex items-center gap-2">
              <Upload size={20} />
              Upload Contact Data
            </h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                file 
                  ? 'border-[#FF9B45] bg-[#FF9B45]/5' 
                  : 'border-[#521C0D]/20 hover:border-[#FF9B45]/50 hover:bg-[#FF9B45]/5'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {!file ? (
                <div className="space-y-4">
                  <Upload className="mx-auto text-[#521C0D]/40" size={48} />
                  <div>
                    <p className="text-[#521C0D] text-lg mb-2">
                      Drop your CSV or Excel file here
                    </p>
                    <p className="text-[#521C0D]/60 text-sm">
                      Supports .csv, .xlsx files with email column
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
                    {loading ? 'Processing...' : 'Select File'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-[#521C0D]" size={24} />
                    <div className="text-left">
                      <div className="text-[#521C0D] font-medium">{file.name}</div>
                      <div className="text-[#521C0D]/60 text-sm">
                        {data.length} records • {emailValidation.valid} valid emails
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
              <h3 className="text-lg font-semibold text-[#521C0D] mb-4 flex items-center gap-2">
                <FileText size={20} />
                Data Preview
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#521C0D]/10">
                      {availableFields.map((header, index) => (
                        <th key={index} className="pb-2 text-left text-[#521C0D]/80 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-[#521C0D]/10 last:border-0">
                        {availableFields.map((field, cellIndex) => (
                          <td key={cellIndex} className="py-2 text-[#521C0D]">
                            {row[field]}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#521C0D] flex items-center gap-2">
                <Mail size={20} />
                Email Content
              </h3>
              <button
                onClick={() => setShowEmailConfigModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#521C0D]/10 text-[#521C0D] rounded-lg hover:bg-[#521C0D]/20 transition-colors"
                disabled={loading}
              >
                <Plus size={16} />
                Add Email
              </button>
            </div>
            
            <div className="space-y-4">
              {configsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-[#521C0D]/30 border-t-[#521C0D] rounded-full animate-spin"></div>
                  <span className="ml-2 text-[#521C0D]/60">Loading email configurations...</span>
                </div>
              ) : emailConfigs.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-[#521C0D] mb-2">
                    Sender Email ({emailConfigs.length} configured)
                  </label>
                  <div className="space-y-3">
                    <select
                      value={selectedEmailConfig}
                      onChange={(e) => setSelectedEmailConfig(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                    >
                      <option value="">Select sender email...</option>
                      {emailConfigs.map((config) => (
                        <option key={config.senderEmail} value={config.senderEmail}>
                          {config.senderEmail}
                        </option>
                      ))}
                    </select>
                    
                    {/* Email Config Management */}
                    <div className="bg-[#521C0D]/5 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-[#521C0D] mb-2">Saved Email Configurations:</h4>
                      <div className="space-y-2">
                        {emailConfigs.map((config) => (
                          <div key={config.senderEmail} className="flex items-center justify-between bg-white rounded-lg p-2 border border-[#521C0D]/10">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-[#521C0D]/60" />
                              <span className="text-sm text-[#521C0D]">{config.senderEmail}</span>
                              {selectedEmailConfig === config.senderEmail && (
                                <span className="text-xs bg-[#FF9B45]/20 text-[#D5451B] px-2 py-1 rounded-full">Selected</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteEmailConfig(config.senderEmail)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                              disabled={loading}
                              title="Delete configuration"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FF9B45]/20 text-[#D5451B] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} />
                    <span className="font-medium">No Email Configurations Found</span>
                  </div>
                  <p className="text-sm mb-3">
                    To send emails, you need to configure at least one sender email with an app password.
                    This is a one-time setup - your credentials will be securely stored.
                  </p>
                  <button
                    onClick={() => setShowEmailConfigModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#D5451B] text-white rounded-lg hover:bg-[#521C0D] transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Configure Email Now
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject (can use {{variables}})"
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {availableFields.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#521C0D] mb-2">
                    Available Fields (click to insert)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFields.map((field, index) => (
                      <button
                        key={index}
                        onClick={() => insertField(field)}
                        className="px-3 py-1 bg-[#FF9B45]/20 text-[#521C0D] rounded-lg hover:bg-[#FF9B45]/30 transition-colors text-sm"
                        disabled={loading}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#521C0D] mb-2">
                  Email Template
                </label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Dear {{name}},

Hope you're doing well at {{company}}!

Best regards"
                  rows={12}
                  className="w-full px-4 py-3 bg-white border border-[#521C0D]/20 rounded-xl text-[#521C0D] placeholder-[#521C0D]/60 focus:outline-none focus:ring-2 focus:ring-[#FF9B45] focus:border-transparent resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-[#521C0D]/60 mt-2">
                  Use double curly braces like {`{{fieldname}}`} for personalization
                </p>
              </div>
            </div>
          </div>

          {data.length > 1 && (
            <div className="bg-[#F4E7E1]/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-[#521C0D]/10">
              <label className="block text-sm font-medium text-[#521C0D] mb-2">
                Preview Different Recipients
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={previewIndex}
                  onChange={(e) => setPreviewIndex(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 bg-white border border-[#521C0D]/20 rounded-lg text-[#521C0D] focus:outline-none focus:ring-2 focus:ring-[#FF9B45]"
                >
                  {data.map((row, index) => (
                    <option key={index} value={index}>
                      {row.name || row.email || `Contact ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              Preview Email
            </button>
            <button
              onClick={handleSendEmails}
              disabled={!data.length || !template || !subject || loading || emailValidation.valid === 0 || !selectedEmailConfig}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                !data.length || !template || !subject || loading || emailValidation.valid === 0 || !selectedEmailConfig
                  ? 'bg-[#521C0D]/20 text-[#521C0D]/40 cursor-not-allowed'
                  : 'bg-[#D5451B] text-white hover:bg-[#521C0D]'
              }`}
            >
              <Send size={20} />
              {loading ? 'Sending...' : `Send to ${emailValidation.valid} Recipients`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftPage