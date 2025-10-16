// ========================================
// FIN RESPONSE OPTIMIZER
// Optimiza respuestas de Fin para ser cortas, precisas y personalizadas
// ========================================

class FinResponseOptimizer {

  // ========================================
  // OPTIMIZACIÓN PRINCIPAL
  // ========================================
  static optimize(response, userName = 'Usuario', options = {}) {
    const defaults = {
      maxWords: 40,          // Máximo 40 palabras
      maxLines: 3,           // Máximo 3 líneas
      maxEmojis: 2,          // Máximo 2 emojis
      ensureName: true,      // Asegurar que incluya el nombre
      removeMarkdown: true,  // Remover markdown (**, __, etc)
      trimWhitespace: true   // Limpiar espacios extras
    };

    const config = { ...defaults, ...options };

    // 1. Limpiar respuesta
    let optimized = response.trim();

    // 2. Remover markdown si se especifica
    if (config.removeMarkdown) {
      optimized = this.removeMarkdown(optimized);
    }

    // 3. Asegurar nombre personalizado
    if (config.ensureName && userName && userName !== 'Usuario') {
      optimized = this.ensurePersonalization(optimized, userName);
    }

    // 4. Limitar líneas
    if (config.maxLines) {
      optimized = this.limitLines(optimized, config.maxLines);
    }

    // 5. Limitar palabras
    if (config.maxWords) {
      optimized = this.limitWords(optimized, config.maxWords);
    }

    // 6. Limitar emojis
    if (config.maxEmojis) {
      optimized = this.limitEmojis(optimized, config.maxEmojis);
    }

    // 7. Limpiar espacios extra
    if (config.trimWhitespace) {
      optimized = this.cleanWhitespace(optimized);
    }

    return optimized;
  }

  // ========================================
  // FUNCIONES DE OPTIMIZACIÓN
  // ========================================

  // Remover markdown común
  static removeMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
      .replace(/\*(.+?)\*/g, '$1')          // *italic*
      .replace(/__(.+?)__/g, '$1')          // __underline__
      .replace(/~~(.+?)~~/g, '$1')          // ~~strikethrough~~
      .replace(/`(.+?)`/g, '$1')            // `code`
      .replace(/#{1,6}\s/g, '')             // # headers
      .replace(/\[(.+?)\]\(.+?\)/g, '$1');  // [links](url)
  }

  // Asegurar personalización con nombre
  static ensurePersonalization(text, userName) {
    // Si ya incluye el nombre, no hacer nada
    if (text.includes(userName)) {
      return text;
    }

    // Patrones comunes de inicio donde podemos insertar nombre
    const patterns = [
      /^(Hola|Buenos días|Buenas tardes|Buenas noches|Claro|Perfecto|Entiendo)/i,
      /^(Te recomiendo|Puedes|Deberías|Es importante|Considera)/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        // Insertar nombre después del saludo
        text = text.replace(pattern, `$1 ${userName},`);
        return text;
      }
    }

    // Si no hay patrón, agregar al inicio
    return `${userName}, ${text}`;
  }

  // Limitar número de líneas
  static limitLines(text, maxLines) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    if (lines.length <= maxLines) {
      return text;
    }

    // Tomar las primeras N líneas
    return lines.slice(0, maxLines).join('\n');
  }

  // Limitar número de palabras
  static limitWords(text, maxWords) {
    const words = text.split(/\s+/);

    if (words.length <= maxWords) {
      return text;
    }

    // Tomar primeras N palabras y agregar ...
    const truncated = words.slice(0, maxWords).join(' ');

    // Si terminó en medio de una oración, remover puntuación final
    return truncated.replace(/[,;:]$/, '') + '...';
  }

  // Limitar número de emojis
  static limitEmojis(text, maxEmojis) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

    let count = 0;
    return text.replace(emojiRegex, (emoji) => {
      count++;
      return count <= maxEmojis ? emoji : '';
    });
  }

  // Limpiar espacios extra
  static cleanWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')           // Múltiples espacios → uno
      .replace(/\s+([.,!?;:])/g, '$1') // Espacio antes de puntuación
      .replace(/\n{3,}/g, '\n\n')     // Múltiples saltos → máximo 2
      .trim();
  }

  // ========================================
  // ANÁLISIS DE RESPUESTA
  // ========================================

  static analyze(text) {
    const words = text.split(/\s+/).length;
    const lines = text.split('\n').filter(l => l.trim()).length;
    const emojis = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const chars = text.length;

    return {
      words,
      lines,
      emojis,
      chars,
      isConcise: words <= 40 && lines <= 3,
      estimatedTokens: Math.ceil(words * 1.3) // Aproximación
    };
  }

  // ========================================
  // PRESETS DE OPTIMIZACIÓN
  // ========================================

  // Ultra conciso (para mensajes de confirmación)
  static optimizeUltraConcise(response, userName) {
    return this.optimize(response, userName, {
      maxWords: 15,
      maxLines: 1,
      maxEmojis: 1
    });
  }

  // Estándar (uso general)
  static optimizeStandard(response, userName) {
    return this.optimize(response, userName, {
      maxWords: 40,
      maxLines: 3,
      maxEmojis: 2
    });
  }

  // Detallado (para explicaciones)
  static optimizeDetailed(response, userName) {
    return this.optimize(response, userName, {
      maxWords: 60,
      maxLines: 4,
      maxEmojis: 2
    });
  }

  // ========================================
  // VALIDACIÓN
  // ========================================

  static isValid(text) {
    if (!text || text.trim().length === 0) {
      return { valid: false, reason: 'Texto vacío' };
    }

    const analysis = this.analyze(text);

    if (analysis.words > 60) {
      return { valid: false, reason: 'Demasiadas palabras', analysis };
    }

    if (analysis.lines > 5) {
      return { valid: false, reason: 'Demasiadas líneas', analysis };
    }

    return { valid: true, analysis };
  }

  // ========================================
  // UTILIDADES
  // ========================================

  // Generar versión corta de un texto largo
  static summarize(text, userName, maxWords = 40) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Tomar primera oración y agregar nombre si no está
    let summary = sentences[0].trim();

    if (!summary.includes(userName)) {
      summary = `${userName}, ${summary}`;
    }

    // Limitar palabras
    return this.limitWords(summary, maxWords);
  }

  // Agregar emoji contextual al final
  static addContextualEmoji(text, context = 'neutral') {
    const emojis = {
      success: '✅',
      warning: '⚠️',
      info: '💡',
      question: '🤔',
      celebrate: '🎉',
      money: '💰',
      save: '🏦',
      goal: '🎯',
      chart: '📊',
      neutral: '👍'
    };

    const emoji = emojis[context] || emojis.neutral;

    // Solo agregar si no tiene emoji al final
    if (!/[\u{1F300}-\u{1F9FF}]$/u.test(text.trim())) {
      return `${text.trim()} ${emoji}`;
    }

    return text;
  }
}

// Exponer globalmente
window.FinResponseOptimizer = FinResponseOptimizer;

console.log('✅ FinResponseOptimizer loaded');
