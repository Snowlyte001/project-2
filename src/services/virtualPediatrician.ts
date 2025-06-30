export class VirtualPediatricianService {
  private static readonly TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
  private static readonly TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;

  // Generate video response using Tavus
  static async generateVideoResponse(
    text: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{ videoUrl: string; conversationId: string } | null> {
    if (!this.TAVUS_API_KEY || !this.TAVUS_REPLICA_ID) {
      console.log('Tavus not configured, using text response only');
      return null;
    }

    try {
      // Create a conversation with the virtual pediatrician
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'x-api-key': this.TAVUS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replica_id: this.TAVUS_REPLICA_ID,
          conversation_name: `ParentGPT Medical Guidance - ${new Date().toISOString()}`,
          callback_url: null, // We'll handle this client-side
          properties: {
            max_call_duration: 300, // 5 minutes max
            participant_left_timeout: 30,
            participant_absent_timeout: 30,
            enable_recording: false,
            enable_transcription: true,
            language: 'en'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Send the medical guidance text to the virtual pediatrician
      await this.sendMessageToConversation(data.conversation_id, this.formatMedicalGuidance(text, urgency));

      return {
        videoUrl: data.conversation_url,
        conversationId: data.conversation_id
      };

    } catch (error) {
      console.error('Virtual pediatrician generation failed:', error);
      return null;
    }
  }

  // Send message to existing conversation
  private static async sendMessageToConversation(conversationId: string, message: string): Promise<void> {
    try {
      await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.TAVUS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          message_type: 'text'
        }),
      });
    } catch (error) {
      console.error('Failed to send message to virtual pediatrician:', error);
    }
  }

  // Format medical guidance for video delivery
  private static formatMedicalGuidance(text: string, urgency: 'low' | 'medium' | 'high'): string {
    const urgencyPrefix = {
      low: "I want to share some helpful guidance with you about your parenting question.",
      medium: "I understand your concern, and I'm here to provide you with important information.",
      high: "This is important medical guidance that requires your immediate attention."
    };

    // Clean and format text for video delivery
    const cleanText = text
      .replace(/\*\*/g, '') // Remove markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/•/g, '') // Remove bullets
      .replace(/🔍|🧠|📚|🌐|⚠️|🚨|😴|🍼|🎭|🌱|🛡️|🏥|💝|🚀/g, '') // Remove emojis
      .replace(/\n\n/g, '. ') // Convert paragraphs to sentences
      .replace(/\n/g, ' ') // Remove line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return `${urgencyPrefix[urgency]} ${cleanText}. Remember, I'm here to support you, but always consult with your child's pediatrician for personalized medical advice.`;
  }

  // Check if Tavus is configured
  static isTavusConfigured(): boolean {
    return !!(this.TAVUS_API_KEY && this.TAVUS_REPLICA_ID);
  }

  // Get conversation status
  static async getConversationStatus(conversationId: string): Promise<any> {
    if (!this.TAVUS_API_KEY) return null;

    try {
      const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        headers: {
          'x-api-key': this.TAVUS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get conversation status:', error);
      return null;
    }
  }
}