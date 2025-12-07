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
} from '@/components/ai-elements/message';
import { ResponseStream } from '@/components/ui/response-stream';
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
  'How does Sequence3 handle multi-channel inboxes?',
  'What are the key features of Sequence3?',
  'How does Sequence3 AI assistant work?',
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
  const [isExpandableOpen, setIsExpandableOpen] = useState(false);
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
      // Silently handle errors - log to console but don't show to users
      console.error('Chat error:', err);
      setStatus('ready');
      // Optionally show a friendly assistant message instead
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: "I'm having trouble processing that right now. Could you please try rephrasing your question?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSubmit({ text: suggestion, files: [] });
  }, [handleSubmit]);

  // Detect when expandable screen (Waitlist) is open and hide widget
  useEffect(() => {
    const checkExpandableOpen = () => {
      // Check if expandable screen element exists in DOM (it has fixed inset-0 and high z-index)
      // The expandable screen uses z-[10000] or z-[1000] class
      const expandableExists = document.querySelector('[class*="fixed inset-0"][class*="z-"]:not(.sq3-widget-panel-wrapper)');
      // Also check if body overflow is hidden (expandable screen sets this when lockScroll is true)
      const bodyOverflowHidden = document.body.style.overflow === 'hidden';
      // Consider expandable open if both conditions are met (more reliable)
      const isOpen = !!expandableExists && bodyOverflowHidden;
      setIsExpandableOpen(isOpen);
    };

    // Check initially
    checkExpandableOpen();

    // Watch for changes to body overflow style
    const observer = new MutationObserver(checkExpandableOpen);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: false,
    });

    // Also watch for DOM changes (expandable screen appearing/disappearing)
    const domObserver = new MutationObserver(checkExpandableOpen);
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Check periodically as a fallback
    const interval = setInterval(checkExpandableOpen, 100);

    return () => {
      observer.disconnect();
      domObserver.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Close widget when expandable screen opens
  useEffect(() => {
    if (isExpandableOpen && isOpen) {
      setIsOpen(false);
    }
  }, [isExpandableOpen, isOpen]);

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
      {/* Fixed Sticker Button in Bottom-Right Corner - Hide when panel is open or expandable is open */}
      {!isOpen && !isExpandableOpen && (
        <div
          className="sq3-widget-sticker-container"
          onClick={() => setIsOpen(true)}
        >
          <StickerPeel
            imageSrc="/sq3ai.svg"
            width={90}
            rotate={0}
            peelBackHoverPct={30}
            peelBackActivePct={10}
            shadowIntensity={0.0}
            lightingIntensity={0.1}
            initialPosition="center"
            draggable={false}
          />
        </div>
      )}

      {/* Chat Panel - Expandable animation - Hide when expandable screen is open */}
      <div 
        className={`sq3-widget-panel-wrapper ${isOpen && !isExpandableOpen ? 'sq3-widget-panel-open' : ''}`}
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
                src="/sq3ai.svg"
                alt="Sequence3 logo"
                width={24}
                height={24}
                className="sq3-widget-logo"
              />
              <span className="sq3-widget-title-text">Sequence3.ai <span className="sq3-widget-beta">Beta</span></span>
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
                      {/* Hey! 👋 I'm Sequence3.ai<br /> */}
                      Ask me anything about how Sequence3 can help grow your business!
                    </p>
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.role === 'assistant' ? (
                        <ResponseStream
                          textStream={message.content}
                          mode="typewriter"
                          speed={30}
                        />
                      ) : (
                        message.content
                      )}
                    </MessageContent>
                  </Message>
                ))
              )}
              
              {status === 'streaming' && (
                <Message from="assistant">
                  <MessageContent>
                    <ResponseStream
                      textStream="Thinking..."
                      mode="typewriter"
                      speed={120}
                    />
                  </MessageContent>
                </Message>
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
