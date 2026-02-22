import type { AIProvider } from './types';

// Lazy-load OpenAI to avoid initialization error at build time
let _openai: any = null;

function getOpenAI() {
  if (!_openai) {
    const { OpenAI } = require('openai');
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  tokens: number;
  model: string;
}

/**
 * Generate AI response using OpenAI
 */
async function generateOpenAIResponse(
  messages: ChatMessage[],
  model = 'gpt-4o-mini'
): Promise<AIResponse> {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 2048,
  });

  const choice = response.choices[0];
  const content = choice.message.content || '';
  
  return {
    content,
    tokens: response.usage?.total_tokens || Math.ceil(content.split(' ').length * 1.3),
    model: response.model,
  };
}

/**
 * Generate AI response using Ollama
 */
async function generateOllamaResponse(
  messages: ChatMessage[],
  model = 'llama3.2'
): Promise<AIResponse> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  const systemMessage = messages.find(m => m.role === 'system');
  const filteredMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
        ...filteredMessages,
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    content: data.message?.content || '',
    tokens: data.prompt_eval_count || 0,
    model: data.model || model,
  };
}

/**
 * Main AI generate function - automatically chooses provider
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  options?: {
    provider?: AIProvider;
    model?: string;
  }
): Promise<AIResponse> {
  const provider = options?.provider || getDefaultProvider();
  const model = options?.model || getDefaultModel(provider);

  try {
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      return generateOpenAIResponse(messages, model);
    }
    
    if (provider === 'ollama') {
      return generateOllamaResponse(messages, model);
    }
    
    throw new Error(`Unknown provider: ${provider}`);
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

/**
 * Get default AI provider based on environment
 */
function getDefaultProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  return 'ollama';
}

/**
 * Get default model for provider
 */
function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    case 'ollama':
      return process.env.OLLAMA_MODEL || 'llama3.2';
    default:
      return 'gpt-4o-mini';
  }
}

/**
 * Check if AI is configured and available
 */
export async function checkAIHealth(): Promise<{ provider: AIProvider; status: 'ok' | 'error'; error?: string }> {
  const provider = getDefaultProvider();
  
  try {
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return { provider, status: 'error', error: 'OPENAI_API_KEY not set' };
      }
      return { provider, status: 'ok' };
    }
    
    if (provider === 'ollama') {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (!response.ok) {
        return { provider, status: 'error', error: 'Ollama not reachable' };
      }
      return { provider, status: 'ok' };
    }
    
    return { provider, status: 'error', error: 'No AI provider configured' };
  } catch (error) {
    return { 
      provider, 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
