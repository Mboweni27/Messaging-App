import { db } from '../firebaseConfig'
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRef, useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { IoIosSend } from 'react-icons/io'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { FaSmile } from 'react-icons/fa'
import { IoMdAttach } from 'react-icons/io'

dayjs.extend(relativeTime)

const daisyColors = [
  'text-primary',
  'text-secondary',
  'text-accent',
  'text-info',
  'text-success',
  'text-warning',
  'text-error',
]

const getColorClass = (name) => {
  const index = name ? name.charCodeAt(0) % daisyColors.length : 0
  return daisyColors[index]
}

// Messages
const MessageReceived = ({ message, sender }) => {

  return (
    <div className="flex items-start space-x-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img
          src={sender?.photo}
          alt={`${sender?.username}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Message Content */}
      <div className="flex flex-col space-y-1">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span
            className={`font-semibold text-base ${getColorClass(sender?.username)}`}
          >
            {sender?.username}
          </span>
          <time className="text-xs text-gray-400">
            {message?.sentAt?.toDate
              ? dayjs(message.sentAt.toDate()).format('h:mm A')
              : 'Sending...'}
          </time>

          {/* Chat Bubble */}
        </div>
        <div className="chat-bubble bg-secondary text-black p-3 rounded-lg max-w-[100%] break-words whitespace-pre-wrap">
          {message.message}
        </div>

        {/* Footer */}
      </div>
    </div>
  )
}

const MessageSent = ({ message }) => {
  return (
    <div className="flex justify-end">
      <div className="flex flex-col space-y-1 items-end">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font semibold text-white text-base ">You</span>
          <time className="text-xs text-gray-400">
            {message?.sentAt?.toDate
              ? dayjs(message.sentAt.toDate()).format('h:mm A')
              : 'Sending...'}
          </time>

          {/* Chat Bubble */}
        </div>
        <div className="chat-bubble bg-primary text-black p-3 rounded-lg max-w-[100%] break-words whitespace-pre-wrap">
          {message.message}
        </div>

        {/* Footer */}
      </div>
    </div>
  )
}

const DateSeparator = ({ date }) => {
  const now = dayjs()
  const formattedDate = date.isSame(now, 'day')
    ? 'Today'
    : date.isSame(now.subtract(1, 'day'), 'day')
      ? 'Yesterday'
      : date.format('MMM D, YYYY')

  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-600"></div>
      <span className="mx-4 text-xs text-base-content/70 font-medium ">
        {formattedDate}
      </span>
      <div className="flex-grow border-t border-gray-600"></div>
    </div>
  )
}

// Chat
const Chat = ({ selectedChat, participants, uid }) => {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!newMessage.trim()) return

    const docRef = await addDoc(
      collection(db, 'chat', selectedChat.id, 'messages'),
      {
        message: newMessage,
        sentBy: uid,
        sentAt: serverTimestamp(),
      },
    )

    await updateDoc(doc(db, 'chat', selectedChat.id), {
      lastMessage: {
        message: newMessage,
        sentBy: uid,
        sentAt: serverTimestamp(),
      },
    })

    setNewMessage('')
    setShowEmojiPicker(false)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  // get messages from subcollection
  const q = selectedChat
    ? query(
        collection(doc(db, 'chat', selectedChat.id), 'messages'),
        orderBy('sentAt', 'asc'),
      )
    : null

  const [snapshot] = useCollection(q)

  const messages = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  // emojis
  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false) // Hide picker after selection
  }

  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (!hasOpened && messages?.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      }, 100)
      setHasOpened(true)
    }
  }, [messages, hasOpened])

  if (!selectedChat) return <BlankChat />

  const friend = participants.find((p) => p.id !== uid)
  const chatName = selectedChat.isGroup
    ? selectedChat.groupName
    : friend?.username

  if (!messages) return <div>Akward Silence</div>


  
  return (
    <div className="flex flex-col h-full w-full max-h-screen relative">
      <div className="p-4 font-bold border-b border-base-content/50 shrink-0 bg-base-100 z-10">
        # {chatName}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-base-200">
        {messages.map((message, index) => {
          const prev = messages[index - 1]
          const currentDate = dayjs(message?.sentAt?.toDate())
          const showDate =
            !prev || !dayjs(prev?.sentAt?.toDate()).isSame(currentDate, 'day')

          const sender = participants.find((p) => p.id === message.sentBy)

          return (
            <div key={message.id}>
              {showDate && <DateSeparator date={currentDate} />}
              {message.sentBy === uid ? (
                <MessageSent message={message} />
              ) : (
                <MessageReceived message={message} sender={sender} />
              )}
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker - absolutely positioned */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            autoFocusSearch={false}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={sendMessage}
        onClick={() => setShowEmojiPicker(false)}
        className="w-full px-4 py-2 bg-base-100 border-t border-base-content/50"
      >
        <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-300 text-xl"
            onClick={(e) => {
              e.stopPropagation() // Prevents click from bubbling to form, stop propagation
              setShowEmojiPicker((prev) => !prev)
            }}
          >
            <FaSmile />
          </button>

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-300 text-xl relative overflow-hidden"
          >
            <IoMdAttach />
            <input
              type="file"
              accept="image/*"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </button>

          <TextareaAutosize
            className="flex-1 resize-none bg-transparent outline-none text-base px-2"
            placeholder="Type a message"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onFocus={() => setShowEmojiPicker(false)}
            onKeyDown={(event) => {
          // Check for Enter key and send message
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault() // Prevent new line on Enter
            sendMessage(event) // Call your existing sendMessage function
          }
        }}
            minRows={1}
            maxRows={6}
          />

          <button
            type="submit"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/80"
          >
            <IoIosSend className="text-lg" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
