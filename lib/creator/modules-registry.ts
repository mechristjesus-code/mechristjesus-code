/**
 * AI Modules Registry — Creator DNA OS
 * Real GitHub integration metadata for all 5 AI modules.
 */

export interface EnvVar {
  key:         string
  example:     string
  description: string
  required:    boolean
}

export interface AiModule {
  id:          string
  name:        string
  category:    'speech' | 'language' | 'tts' | 'vision' | 'edge' | 'utility'
  description: string
  githubUrl:   string
  cloneUrl:    string
  docsUrl?:    string
  license:     string
  language:    string
  latestVersion: string
  stars:       number
  status:      'available' | 'self-hosted' | 'coming-soon'
  setupSteps:  string[]
  usedFor:     string[]
  envVars:     EnvVar[]
  icon:        string
  portDefault?: number
  healthPath?:  string
}

export const AI_MODULES: AiModule[] = [
  // ── 1. OpenAI Whisper ──────────────────────────────────────────────────────
  {
    id:             'whisper',
    name:           'OpenAI Whisper',
    category:       'speech',
    language:       'Python',
    latestVersion:  'v20250625',
    stars:          104024,
    license:        'MIT',
    status:         'self-hosted',
    icon:           '🎙️',
    githubUrl:      'https://github.com/openai/whisper',
    cloneUrl:       'https://github.com/openai/whisper.git',
    docsUrl:        'https://github.com/openai/whisper#readme',
    portDefault:    9000,
    healthPath:     '/health',
    description:
      'Robust automatic speech recognition (ASR) trained on 680,000 hours of multilingual data. ' +
      'Transcribes audio and video to text in 99 languages with near-human accuracy. ' +
      'The backbone of Creator DNA OS voice input and video transcription.',
    usedFor: [
      'YouTube video transcription',
      'Podcast-to-script conversion',
      'Audio file transcription',
      'Multi-language support',
    ],
    envVars: [
      { key: 'WHISPER_HOST',  example: 'http://localhost:9000', description: 'Base URL of your Whisper API server', required: true },
      { key: 'WHISPER_MODEL', example: 'base',                  description: 'Model size: tiny/base/small/medium/large', required: false },
    ],
    setupSteps: [
      'git clone https://github.com/openai/whisper.git && cd whisper',
      'pip install openai-whisper',
      '# Optional: run as an API server with whisper-asr-webservice',
      'pip install uvicorn fastapi python-multipart',
      'whisper audio.mp3 --model base --output_format txt',
      '# Add to .env: WHISPER_HOST=http://localhost:9000',
    ],
  },

  // ── 2. Ollama ─────────────────────────────────────────────────────────────
  {
    id:             'ollama',
    name:           'Ollama',
    category:       'language',
    language:       'Go',
    latestVersion:  'v0.9.6',
    stars:          175276,
    license:        'MIT',
    status:         'self-hosted',
    icon:           '🦙',
    githubUrl:      'https://github.com/ollama/ollama',
    cloneUrl:       'https://github.com/ollama/ollama.git',
    docsUrl:        'https://ollama.ai',
    portDefault:    11434,
    healthPath:     '/api/tags',
    description:
      'Run Llama 3.3, Gemma 3, Mistral, DeepSeek R2, Phi-4, Qwen3, and 100+ open-source LLMs ' +
      'locally with zero cloud dependency. Powers the offline AI inference layer of Creator DNA OS ' +
      'for fully private script generation and chat.',
    usedFor: [
      'Local LLM inference (Llama 3, Mistral, Gemma)',
      'Offline script & content generation',
      'Private AI chat (no data leaves device)',
      'Custom model fine-tuning reference',
    ],
    envVars: [
      { key: 'OLLAMA_HOST',  example: 'http://localhost:11434', description: 'Ollama API base URL', required: true },
      { key: 'OLLAMA_MODEL', example: 'llama3',                 description: 'Default model to use', required: false },
    ],
    setupSteps: [
      'git clone https://github.com/ollama/ollama.git',
      '# macOS/Linux one-liner:',
      'curl -fsSL https://ollama.ai/install.sh | sh',
      'ollama pull llama3',
      'ollama pull mistral',
      '# Ollama starts automatically on port 11434',
      '# Add to .env: OLLAMA_HOST=http://localhost:11434',
    ],
  },

  // ── 3. Piper TTS ─────────────────────────────────────────────────────────
  {
    id:             'piper',
    name:           'Piper TTS',
    category:       'tts',
    language:       'C++',
    latestVersion:  'v1.4.2',
    stars:          4643,
    license:        'GPL-3.0',
    status:         'self-hosted',
    icon:           '🔊',
    githubUrl:      'https://github.com/OHF-Voice/piper1-gpl',
    cloneUrl:       'https://github.com/OHF-Voice/piper1-gpl.git',
    portDefault:    5500,
    healthPath:     '/',
    description:
      'Fast and local neural text-to-speech engine built in C++. Generates natural-sounding ' +
      'voice-overs from scripts without any cloud API calls. Supports 40+ languages and ' +
      'dozens of voice models. Used in Creator DNA OS for automated narration.',
    usedFor: [
      'Script-to-voice-over generation',
      'Podcast narration automation',
      'Video voice-over production',
      'Edge device TTS (Raspberry Pi)',
    ],
    envVars: [
      { key: 'PIPER_HOST',  example: 'http://localhost:5500', description: 'Piper HTTP server URL', required: true },
      { key: 'PIPER_VOICE', example: 'en_US-amy-medium',      description: 'Default voice model',   required: false },
    ],
    setupSteps: [
      'git clone https://github.com/OHF-Voice/piper1-gpl.git && cd piper1-gpl',
      'pip install piper-tts',
      '# Download a voice model',
      'python3 -m piper.download en_US-amy-medium',
      '# Generate audio from text',
      'echo "Hello world" | piper --model en_US-amy-medium --output_file hello.wav',
      '# Add to .env: PIPER_HOST=http://localhost:5500',
    ],
  },

  // ── 4. Whisplay AI Chatbot ───────────────────────────────────────────────
  {
    id:             'whisplay',
    name:           'Whisplay AI Chatbot',
    category:       'edge',
    language:       'TypeScript',
    latestVersion:  'v2.3.2',
    stars:          479,
    license:        'MIT',
    status:         'self-hosted',
    icon:           '🍓',
    githubUrl:      'https://github.com/PiSugar/whisplay-ai-chatbot',
    cloneUrl:       'https://github.com/PiSugar/whisplay-ai-chatbot.git',
    description:
      'Pocket-sized AI chatbot built on Raspberry Pi Zero 2W / Pi 5 using TypeScript. ' +
      'Combines Whisper (STT) + Ollama (LLM) + Piper (TTS) on a single edge device. ' +
      'The reference implementation for running Creator DNA OS completely offline on hardware.',
    usedFor: [
      'Fully offline edge AI assistant',
      'Hardware integration reference',
      'Voice-in / voice-out workflow',
      'Pi Zero 2W & Pi 5 deployment',
    ],
    envVars: [
      { key: 'WHISPLAY_HOST', example: 'http://raspberrypi.local:3000', description: 'Whisplay device URL', required: false },
    ],
    setupSteps: [
      'git clone https://github.com/PiSugar/whisplay-ai-chatbot.git',
      '# Requires: Raspberry Pi Zero 2W or Pi 5 + PiSugar battery',
      'npm install',
      '# Install Whisper + Ollama + Piper on the Pi',
      'npm run setup  # Automated install script',
      'npm start      # Starts the chatbot',
      '# Access via SSH or attach display',
    ],
  },

  // ── 5. PiSugar Power Manager ─────────────────────────────────────────────
  {
    id:             'pisugar',
    name:           'PiSugar Power Manager',
    category:       'utility',
    language:       'Rust',
    latestVersion:  'v2.0.9',
    stars:          193,
    license:        'GPL-3.0',
    status:         'self-hosted',
    icon:           '🔋',
    githubUrl:      'https://github.com/PiSugar/pisugar-power-manager-rs',
    cloneUrl:       'https://github.com/PiSugar/pisugar-power-manager-rs.git',
    portDefault:    8421,
    healthPath:     '/',
    description:
      'Rust-based power management daemon and web UI for PiSugar battery boards. ' +
      'Monitors charge level, controls safe shutdown, and provides a REST API. ' +
      'Essential for portable Creator DNA OS deployments on Raspberry Pi hardware.',
    usedFor: [
      'Battery charge monitoring',
      'Safe shutdown automation',
      'Portable Pi device management',
      'REST API for power state',
    ],
    envVars: [
      { key: 'PISUGAR_HOST', example: 'http://raspberrypi.local:8421', description: 'PiSugar web dashboard URL', required: false },
    ],
    setupSteps: [
      'git clone https://github.com/PiSugar/pisugar-power-manager-rs.git',
      'cd pisugar-power-manager-rs',
      '# Install Rust if needed: curl https://sh.rustup.rs -sSf | sh',
      'cargo build --release',
      'sudo ./install.sh',
      '# Web UI at http://localhost:8421',
      '# REST API: GET http://localhost:8421/api/v1/state',
    ],
  },
]

export function getModule(id: string): AiModule | undefined {
  return AI_MODULES.find((m) => m.id === id)
}

export function getModulesByCategory(cat: AiModule['category']): AiModule[] {
  return AI_MODULES.filter((m) => m.category === cat)
}
