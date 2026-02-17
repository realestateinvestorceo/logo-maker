import { useState } from 'react'

export default function BossFeedbackPanel({ logoId, feedback, onFeedback }) {
  const [comment, setComment] = useState(feedback?.comment || '')
  const [name, setName] = useState('')

  const handleReaction = (reaction) => {
    onFeedback(logoId, reaction, comment, name)
  }

  const handleComment = () => {
    if (!comment.trim()) return
    onFeedback(logoId, feedback?.reaction || null, comment.trim(), name)
  }

  return (
    <div className="px-4 py-3 border-t border-border">
      {/* Reaction buttons */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => handleReaction('thumbs_up')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
            feedback?.reaction === 'thumbs_up'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          Yes
        </button>

        <button
          onClick={() => handleReaction('thumbs_down')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
            feedback?.reaction === 'thumbs_down'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          No
        </button>

        <button
          onClick={() => handleReaction('star')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
            feedback?.reaction === 'star'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
          }`}
        >
          <svg className="w-4 h-4" fill={feedback?.reaction === 'star' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          Shortlist
        </button>
      </div>

      {/* Comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
          placeholder="Leave a comment..."
          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {comment.trim() && (
          <button
            onClick={handleComment}
            className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition-colors"
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
