import React from 'react';
import { MessageCircle, Star } from 'lucide-react';

// ============================================
// MESSAGE BUBBLE COMPONENT
// WhatsApp-style chat for price negotiation
// ============================================

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    type: 'text' | 'price_proposal';
    amount?: number;
    timestamp: string | Date;
    read: boolean;
  };
  isOwnMessage: boolean;
  locale?: 'en' | 'fr' | 'ar-TN';
}

export function MessageBubble({ message, isOwnMessage, locale = 'en' }: MessageBubbleProps) {
  
  // Convert string timestamp to Date if needed
  const timestamp = typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp;
  
  // Get translated sender label
  const getSenderLabel = (senderId: string) => {
    if (senderId === 'worker') {
      return locale === 'ar-TN' ? 'العامل' : locale === 'fr' ? 'Travailleur' : 'Worker';
    } else {
      return locale === 'ar-TN' ? 'عميل' : locale === 'fr' ? 'Client' : 'Customer';
    }
  };
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md `}>
        {!isOwnMessage && (
          <div className="text-xs text-neutral-500 mb-1">
            {getSenderLabel(message.senderId)}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary-600 text-white ml-auto'
              : 'bg-neutral-100 text-neutral-900'
          }`}
        >
          {message.type === 'price_proposal' && message.amount && (
            <div className="bg-white/20 rounded-lg px-3 py-2 mb-2">
              <div className="text-center">
                <p className="text-xs font-medium opacity-90">
                  {locale === 'ar-TN' ? 'اقتراح' : locale === 'fr' ? 'Proposition' : 'Price Proposal'}
                </p>
                <p className="text-lg font-bold">
                  TND {message.amount.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <p className="text-sm">{message.text}</p>
        </div>
        <div className={`text-xs text-neutral-400 mt-1 ${isOwnMessage ? 'text-end' : 'text-start'}`}>
          {timestamp.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : locale === 'ar-TN' ? 'ar-TN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// RATING STARS COMPONENT
// For reviews and ratings
// ============================================

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
  locale?: 'en' | 'fr' | 'ar-TN';
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  reviewCount,
  locale = 'en'
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHalfFilled = starValue - 0.5 === rating && !interactive;

          return (
            <Star
              key={index}
              className={`${sizeClasses[size]} ${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
              } ${
                isFilled
                  ? 'text-yellow-400 fill-current'
                  : isHalfFilled
                  ? 'text-yellow-400 fill-current opacity-50'
                  : 'text-neutral-300'
              }`}
              onClick={() => handleClick(starValue)}
            />
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm font-medium text-neutral-900 ms-2">
          {rating.toFixed(1)}
        </span>
      )}
      
      {reviewCount && (
        <span className="text-sm text-neutral-500 ms-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

// ============================================
// CHAT INPUT COMPONENT
// For message composition
// ============================================

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  locale?: 'en' | 'fr' | 'ar-TN';
  disabled?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  placeholder, 
  locale = 'en',
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const [isMinimized, setIsMinimized] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const defaultPlaceholder = {
    en: 'Type a message...',
    fr: 'Tapez un message...',
    'ar-TN': 'اكتب رسالة...'
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-600 transition-all duration-200 z-10 ${
      isMinimized ? 'h-12' : 'h-auto'
    }`}>
      {/* Toggle Bar */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {isMinimized ? 
              (locale === 'en' ? 'Chat' : locale === 'fr' ? 'Chat' : 'الدردشة') : 
              (locale === 'en' ? 'Click to minimize' : locale === 'fr' ? 'Cliquer pour minimiser' : 'انقر للتصغير')
            }
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isMinimized ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Input Area */}
      {!isMinimized && (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t border-neutral-200 dark:border-neutral-600">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder || defaultPlaceholder[locale]}
              disabled={disabled}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed transition-colors duration-200"
            />
          </div>
          <button 
            type="submit" 
            disabled={disabled || !message.trim()}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-5 h-5">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
