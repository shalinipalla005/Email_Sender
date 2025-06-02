import { X, Mail } from 'lucide-react'

const PreviewModal = ({ isOpen, content, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mail className="text-purple-400" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Email Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="text-white/70 hover:text-white" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {content && (
            <div className="space-y-4">
              {/* Email Headers */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm font-medium w-16">To:</span>
                  <span className="text-white">{content.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm font-medium w-16">Subject:</span>
                  <span className="text-white font-medium">{content.subject}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {content.message}
                  </div>
                </div>
              </div>

              {/* Email Footer Simulation */}
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-white/60 text-xs">
                  This is a preview of how your email will appear to recipients
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/20 border border-white/30 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
            Send Email
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal