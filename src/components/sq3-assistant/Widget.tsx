'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import StickerPeel from '@/components/ui/widget-peel';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import './widget.css';

const SUGGESTED_QUESTIONS = [
  'What does Sequence3 do?',
  'How does SQ3 handle multi-channel inboxes?',
  'What are the key features of SQ3?',
  'How does SQ3 AI assistant work?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function SQ3AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const handleSubmit = useCallback(async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    if (!hasText) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: message.text.trim(),
    };

    const allMessages = [...messagesRef.current, userMessage];
    setMessages(allMessages);
    setStatus('submitted');
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      setStatus('streaming');
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus('ready');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStatus('error');
      console.error('Chat error:', err);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSubmit({ text: suggestion, files: [] });
  }, [handleSubmit]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Fixed Sticker Button in Bottom-Right Corner - Hide when panel is open */}
      {!isOpen && (
        <div
          className="sq3-widget-sticker-container"
          onClick={() => setIsOpen(true)}
        >
          <StickerPeel
            imageSrc="/purple.svg"
            width={50}
            rotate={15}
            peelBackHoverPct={10}
            peelBackActivePct={10}
            shadowIntensity={0.0}
            lightingIntensity={0.1}
            initialPosition="center"
            draggable={false}
          />
        </div>
      )}

      {/* Chat Panel - Expandable animation */}
      <div 
        className={`sq3-widget-panel-wrapper ${isOpen ? 'sq3-widget-panel-open' : ''}`}
        onClick={(e) => {
          // Close panel when clicking backdrop
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <div 
          className="sq3-widget-panel" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="sq3-widget-close-button"
            aria-label="Close chat"
          >
            <X className="sq3-widget-icon-sm" />
          </button>

          {/* Title Header with Logo */}
          <div className="sq3-widget-title-header">
            <div className="sq3-widget-title-container">
              <Image
                src="/purple.svg"
                alt="Sequence3 logo"
                width={24}
                height={24}
                className="sq3-widget-logo"
              />
              <span className="sq3-widget-title-text">Sequence3.ai</span>
            </div>
          </div>

          {/* Rounded-full Chat Container */}
          <div className="sq3-widget-chat-container">
            {/* Conversation */}
            <Conversation className="sq3-widget-conversation">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState>
                  <div className="sq3-widget-empty-content">
                    <p className="sq3-widget-empty-text">
                      How can I assist you <br /> today?
                    </p>
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      <MessageResponse>{message.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))
              )}
              
              {status === 'streaming' && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>Thinking...</MessageResponse>
                  </MessageContent>
                </Message>
              )}

              {error && (
                <div className="sq3-widget-error">
                  <p>{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setStatus('ready');
                    }}
                    className="sq3-widget-error-dismiss"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="sq3-widget-input-wrapper">
            {messages.length === 0 && (
              <Suggestions className="sq3-widget-suggestions">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={handleSuggestionClick}
                  />
                ))}
              </Suggestions>
            )}
            
            <div className="sq3-widget-prompt-container">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputBody>
                  <PromptInputTextarea placeholder="Ask anything about Sequence3..." />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputSubmit
                    disabled={status === 'streaming' || status === 'submitted'}
                    status={status === 'streaming' ? 'streaming' : status === 'submitted' ? 'submitted' : 'ready'}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
