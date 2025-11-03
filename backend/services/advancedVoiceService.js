// MEJORA 2: Voice Service Completo con STT/TTS Avanzado
// Archivo: backend/services/advancedVoiceService.js

const winston = require('winston');
const axios = require('axios');

class AdvancedVoiceService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/voice.log' }),
        new winston.transports.Console()
      ]
    });

    // Configuración de proveedores de voz
    this.providers = {
      openai: {
        name: 'OpenAI Whisper + TTS',
        sttEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
        ttsEndpoint: 'https://api.openai.com/v1/audio/speech',
        models: {
          stt: 'whisper-1',
          tts: 'tts-1'
        },
        voices: {
          'es': ['nova', 'shimmer'],
          'en': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
          'fr': ['nova', 'shimmer'],
          'de': ['nova', 'shimmer'],
          'it': ['nova', 'shimmer'],
          'pt': ['nova', 'shimmer']
        }
      },
      azure: {
        name: 'Azure Cognitive Services',
        sttEndpoint: 'https://econeura-speech.cognitiveservices.azure.com/stt/speech/recognize',
        ttsEndpoint: 'https://econeura-speech.cognitiveservices.azure.com/tts/speak',
        voices: {
          'es': ['es-ES-ElviraNeural', 'es-ES-AlvaroNeural'],
          'en': ['en-US-AriaNeural', 'en-US-GuyNeural'],
          'fr': ['fr-FR-DeniseNeural', 'fr-FR-HenriNeural'],
          'de': ['de-DE-KatjaNeural', 'de-DE-ConradNeural'],
          'it': ['it-IT-ElsaNeural', 'it-IT-DiegoNeural'],
          'pt': ['pt-BR-FranciscaNeural', 'pt-BR-AntonioNeural']
        }
      }
    };

    this.currentProvider = 'openai'; // Fallback a Azure si OpenAI falla
    this.languageDetection = true;
    this.voiceEnabled = true;
  }

  // SPEECH-TO-TEXT (STT) Avanzado
  async speechToText(audioBuffer, language = 'auto', options = {}) {
    try {
      this.logger.info(`🎤 STT Request - Language: ${language}, Size: ${audioBuffer.length} bytes`);

      // Detectar idioma si es 'auto'
      if (language === 'auto') {
        language = await this.detectLanguage(audioBuffer);
        this.logger.info(`🔍 Language detected: ${language}`);
      }

      const provider = this.providers[this.currentProvider];
      const result = await this.callSTTProvider(provider, audioBuffer, language, options);

      // Log para analytics
      await this.logVoiceUsage('stt', language, audioBuffer.length, result.confidence || 0.95);

      return {
        success: true,
        text: result.text,
        language: language,
        confidence: result.confidence || 0.95,
        duration: result.duration || 0,
        provider: this.currentProvider
      };

    } catch (error) {
      this.logger.error('❌ STT Error:', error);
      
      // Fallback a otro provider
      if (this.currentProvider === 'openai') {
        this.currentProvider = 'azure';
        this.logger.info('🔄 Fallback to Azure STT');
        return await this.speechToText(audioBuffer, language, options);
      }

      return {
        success: false,
        error: error.message,
        text: '',
        language: language
      };
    }
  }

  async callSTTProvider(provider, audioBuffer, language, options) {
    if (provider.name.includes('OpenAI')) {
      return await this.callOpenAI_STT(audioBuffer, language, options);
    } else if (provider.name.includes('Azure')) {
      return await this.callAzure_STT(audioBuffer, language, options);
    }
  }

  async callOpenAI_STT(audioBuffer, language, _options) {
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'verbose_json');

    const response = await axios.post(
      this.providers.openai.sttEndpoint,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      }
    );

    return {
      text: response.data.text,
      confidence: response.data.segments?.[0]?.avg_logprob ? Math.exp(response.data.segments[0].avg_logprob) : 0.95,
      duration: response.data.duration || 0
    };
  }

  async callAzure_STT(audioBuffer, language, _options) {
    const response = await axios.post(
      this.providers.azure.sttEndpoint,
      audioBuffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'audio/wav',
          'Accept': 'application/json'
        },
        params: {
          language: language,
          format: 'detailed'
        },
        timeout: 30000
      }
    );

    return {
      text: response.data.DisplayText,
      confidence: response.data.Confidence || 0.95,
      duration: response.data.Duration || 0
    };
  }

  // TEXT-TO-SPEECH (TTS) Avanzado
  async textToSpeech(text, language = 'es', voice = 'auto', options = {}) {
    try {
      this.logger.info(`🔊 TTS Request - Language: ${language}, Text length: ${text.length}`);

      // Seleccionar voz si es 'auto'
      if (voice === 'auto') {
        voice = this.selectBestVoice(language, text);
        this.logger.info(`🎵 Voice selected: ${voice}`);
      }

      const provider = this.providers[this.currentProvider];
      const audioBuffer = await this.callTTSProvider(provider, text, language, voice, options);

      // Log para analytics
      await this.logVoiceUsage('tts', language, text.length, 1.0);

      return {
        success: true,
        audioBuffer: audioBuffer,
        voice: voice,
        language: language,
        duration: this.estimateAudioDuration(text),
        provider: this.currentProvider
      };

    } catch (error) {
      this.logger.error('❌ TTS Error:', error);
      
      // Fallback a otro provider
      if (this.currentProvider === 'openai') {
        this.currentProvider = 'azure';
        this.logger.info('🔄 Fallback to Azure TTS');
        return await this.textToSpeech(text, language, voice, options);
      }

      return {
        success: false,
        error: error.message,
        audioBuffer: null
      };
    }
  }

  async callTTSProvider(provider, text, language, voice, options) {
    if (provider.name.includes('OpenAI')) {
      return await this.callOpenAI_TTS(text, voice, options);
    } else if (provider.name.includes('Azure')) {
      return await this.callAzure_TTS(text, voice, options);
    }
  }

  async callOpenAI_TTS(text, voice, options) {
    const response = await axios.post(
      this.providers.openai.ttsEndpoint,
      {
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
        speed: options.speed || 1.0
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    return Buffer.from(response.data);
  }

  async callAzure_TTS(text, voice, options) {
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.split('-')[0]}-${voice.split('-')[1]}">
        <voice name="${voice}">
          <prosody rate="${options.speed || 1.0}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await axios.post(
      this.providers.azure.ttsEndpoint,
      ssml,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    return Buffer.from(response.data);
  }

  // DETECCIÓN DE IDIOMA
  async detectLanguage(audioBuffer) {
    try {
      // Usar OpenAI Whisper para detectar idioma
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        this.providers.openai.sttEndpoint,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      // Mapear códigos de idioma de Whisper a códigos estándar
      const languageMap = {
        'spanish': 'es',
        'english': 'en',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt'
      };

      return languageMap[response.data.language] || 'es';
    } catch (error) {
      this.logger.error('❌ Language detection error:', error);
      return 'es'; // Fallback a español
    }
  }

  // SELECCIÓN DE VOZ INTELIGENTE
  selectBestVoice(language, text) {
    const voices = this.providers[this.currentProvider].voices[language];
    if (!voices || voices.length === 0) {
      return 'nova'; // Fallback
    }

    // Seleccionar voz basada en características del texto
    const textLength = text.length;
    const isQuestion = text.includes('?');
    const isExclamation = text.includes('!');

    if (isQuestion) {
      // Voz más expresiva para preguntas
      return voices.find(v => v.includes('Neural')) || voices[0];
    } else if (isExclamation) {
      // Voz más energética para exclamaciones
      return voices.find(v => v.includes('Neural')) || voices[0];
    } else if (textLength > 200) {
      // Voz más clara para textos largos
      return voices.find(v => v.includes('Neural')) || voices[0];
    }

    return voices[0]; // Voz por defecto
  }

  // ESTIMACIÓN DE DURACIÓN DE AUDIO
  estimateAudioDuration(text) {
    // Estimación basada en velocidad de habla promedio (150 palabras/minuto)
    const wordsPerMinute = 150;
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / wordsPerMinute) * 60); // en segundos
  }

  // VOICE COMMANDS
  async processVoiceCommand(audioBuffer, context = {}) {
    try {
      const sttResult = await this.speechToText(audioBuffer, 'auto');
      
      if (!sttResult.success) {
        return { success: false, error: sttResult.error };
      }

      const command = this.parseVoiceCommand(sttResult.text, context);
      
      return {
        success: true,
        command: command,
        text: sttResult.text,
        confidence: sttResult.confidence
      };

    } catch (error) {
      this.logger.error('❌ Voice command processing error:', error);
      return { success: false, error: error.message };
    }
  }

  parseVoiceCommand(text, _context) {
    const lowerText = text.toLowerCase();
    
    // Comandos de navegación
    if (lowerText.includes('ir a') || lowerText.includes('abrir')) {
      if (lowerText.includes('ceo') || lowerText.includes('presidencia')) {
        return { type: 'navigate', target: 'ceo', neuraId: 0 };
      } else if (lowerText.includes('cfo') || lowerText.includes('finanzas')) {
        return { type: 'navigate', target: 'cfo', neuraId: 2 };
      } else if (lowerText.includes('cmo') || lowerText.includes('marketing')) {
        return { type: 'navigate', target: 'cmo', neuraId: 7 };
      }
    }

    // Comandos de chat
    if (lowerText.includes('enviar mensaje') || lowerText.includes('mandar')) {
      return { type: 'send_message', text: text };
    }

    // Comandos de sistema
    if (lowerText.includes('modo oscuro') || lowerText.includes('dark mode')) {
      return { type: 'toggle_theme', theme: 'dark' };
    } else if (lowerText.includes('modo claro') || lowerText.includes('light mode')) {
      return { type: 'toggle_theme', theme: 'light' };
    }

    // Comando por defecto
    return { type: 'chat_message', text: text };
  }

  // ANALYTICS Y LOGGING
  async logVoiceUsage(type, language, inputSize, confidence) {
    try {
      // Aquí se podría integrar con el sistema de analytics
      this.logger.info(`📊 Voice Usage - Type: ${type}, Language: ${language}, Size: ${inputSize}, Confidence: ${confidence}`);
    } catch (error) {
      this.logger.error('❌ Error logging voice usage:', error);
    }
  }

  // HEALTH CHECK
  async healthCheck() {
    try {
      // Test básico de conectividad
      const testText = "Test de conectividad";
      await this.textToSpeech(testText, 'es', 'nova');
      
      return {
        status: 'healthy',
        provider: this.currentProvider,
        voiceEnabled: this.voiceEnabled,
        languageDetection: this.languageDetection,
        availableVoices: Object.keys(this.providers[this.currentProvider].voices),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // CONFIGURACIÓN DINÁMICA
  setProvider(provider) {
    if (this.providers[provider]) {
      this.currentProvider = provider;
      this.logger.info(`🔄 Voice provider changed to: ${provider}`);
    }
  }

  setLanguageDetection(enabled) {
    this.languageDetection = enabled;
    this.logger.info(`🔍 Language detection ${enabled ? 'enabled' : 'disabled'}`);
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    this.logger.info(`🔊 Voice functionality ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = AdvancedVoiceService;

