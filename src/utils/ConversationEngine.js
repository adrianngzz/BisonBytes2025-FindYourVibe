// utils/ConversationEngine.js
import MoodAnalyzer from './MoodAnalyzer';

/**
 * Advanced conversation engine that manages dialog flow, context tracking,
 * and natural language understanding for the Mood Music App
 */
class ConversationEngine {
  constructor() {
    // Conversation state
    this.context = {
      currentTopic: 'greeting',
      detectedMoods: [],
      mentionedGenres: [],
      mentionedArtists: [],
      conversationStage: 'initial',
      userPreferences: {},
      conversationHistory: [],
      questionAsked: false,
      followUpTopics: []
    };

    // Entity recognition patterns
    this.entities = {
      genres: [
        'rock', 'pop', 'hip hop', 'rap', 'classical', 'jazz', 'blues', 'country', 
        'electronic', 'dance', 'edm', 'r&b', 'soul', 'folk', 'indie', 'metal', 
        'punk', 'alternative', 'reggae', 'ambient', 'techno', 'house', 'disco',
        'funk', 'latin', 'trap', 'lo-fi', 'instrumental', 'soundtrack'
      ],
      activities: [
        'workout', 'exercise', 'running', 'jogging', 'walking', 'studying', 'reading',
        'working', 'relaxing', 'sleeping', 'meditating', 'cooking', 'cleaning',
        'driving', 'commuting', 'party', 'dancing', 'focus', 'concentration'
      ],
      timeOfDay: [
        'morning', 'afternoon', 'evening', 'night', 'late night', 'dawn', 'dusk',
        'sunrise', 'sunset', 'midnight', 'today', 'tonight', 'daytime'
      ]
    };

    // Dialog flow for different conversation stages
    this.dialogFlow = {
      greeting: [
        "Hi there! I'm here to recommend music that matches your mood. How are you feeling today?",
        "Hello! I'd love to find the perfect music for your current mood. How are you feeling?",
        "Welcome! Tell me how you're feeling, and I'll suggest some music that might resonate with you."
      ],
      moodExploration: [
        "Can you tell me more about why you're feeling {mood}?",
        "How long have you been feeling {mood}?",
        "What kind of day have you had that's making you feel {mood}?",
        "On a scale from 1-10, how intense is this {mood} feeling?"
      ],
      genreQuestion: [
        "What kind of music do you usually enjoy when you're feeling {mood}?",
        "Do you have any favorite genres or artists you listen to when you're {mood}?",
        "Are there specific types of music that help when you're feeling this way?"
      ],
      activityQuestion: [
        "Are you doing anything specific right now that you need music for?",
        "Will you be listening to this music during a particular activity?",
        "Is this for background music or something you'll be actively listening to?"
      ],
      clarification: [
        "I'm not quite sure I understood. Could you tell me more about how you're feeling?",
        "I'd like to get a better sense of your mood. Could you describe it differently?",
        "To find the perfect music, I need to understand your current mood better. Can you elaborate?"
      ],
      recommendation: [
        "Based on what you've told me, I think I have some great {genre} recommendations that match your {mood} mood.",
        "I think I've found some music that will be perfect for your current {mood} state.",
        "Given how you're feeling, I've selected some {genre} tracks that might resonate with you right now."
      ],
      followUp: [
        "How do these recommendations sound to you?",
        "Do any of these suggestions match what you were looking for?",
        "Would you like me to find something different instead?"
      ]
    };
  }

  /**
   * Process user input and generate appropriate response
   * @param {string} userInput - The user's message
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @returns {Object} Response object with text and metadata
   */
  processInput(userInput, conversationHistory = []) {
    // Update conversation history
    this.context.conversationHistory = conversationHistory;
    
    // Track the last message for context
    const lastUserMessage = userInput.toLowerCase();
    const lastAIResponse = conversationHistory.length > 0 
      ? conversationHistory.filter(msg => msg.speaker === "AI").pop()?.text
      : null;

    // Analyze the input
    const analysis = this.analyzeInput(lastUserMessage, lastAIResponse);
    
    // Update our conversation context
    this.updateContext(analysis);
    
    // Determine the next conversation move
    const nextMove = this.determineNextMove();
    
    // Generate a response based on the next conversation move
    const response = this.generateResponse(nextMove);
    
    return {
      text: response,
      analysis: analysis,
      context: {...this.context}
    };
  }

  /**
   * Analyze user input for intents, entities, and sentiments
   * @param {string} userInput - User's message
   * @param {string} lastAIResponse - The last AI response for context
   * @returns {Object} Analysis results
   */
  analyzeInput(userInput, lastAIResponse) {
    const input = userInput.toLowerCase();
    
    // Detect intents
    const intents = this.detectIntents(input, lastAIResponse);
    
    // Extract entities (genres, artists, activities)
    const entities = this.extractEntities(input);
    
    // Perform sentiment/mood analysis
    const moodAnalysis = this.analyzeMood(input);
    
    return {
      intents,
      entities,
      moodAnalysis,
      originalInput: userInput
    };
  }

  /**
   * Detect user intents from their message
   * @param {string} input - User's message
   * @param {string} lastAIResponse - Last AI response for context
   * @returns {Object} Detected intents with confidence scores
   */
  detectIntents(input, lastAIResponse) {
    const intents = {
      greeting: 0,
      moodSharing: 0,
      askingForRecommendation: 0,
      specifyingGenre: 0,
      specifyingActivity: 0,
      rejecting: 0,
      affirming: 0,
      questioning: 0,
      gratitude: 0,
      confused: 0
    };
    
    // Greeting intent
    if (/^(hi|hello|hey|greetings|howdy|what'?s? up|yo|sup)/i.test(input)) {
      intents.greeting = 0.9;
    }
    
    // Mood sharing intent
    if (/(?:i('?m| am)|feeling|feel|i've been|having|had) (?:been |a |very |really |extremely |quite |somewhat )?(?:feeling |felt )?(happy|sad|angry|content|excited|bored|anxious|calm|stressed|relaxed|depressed|overwhelmed|tired|energetic|good|bad|okay|fine|great|terrible|awful|wonderful|amazing|down|up|low)/i.test(input)) {
      intents.moodSharing = 0.85;
    }
    
    // Asking for recommendation intent
    if (/(?:recommend|suggestion|suggest|what|give me|play|find|looking for) (?:some |a |good |great |)(?:music|songs?|tracks?|artists?|bands?)/i.test(input) || 
        /what (?:songs?|music|artists?) (?:should|would|could|can) (?:i|you) (?:recommend|suggest|play|listen to)/i.test(input)) {
      intents.askingForRecommendation = 0.8;
    }
    
    // Specifying genre intent
    if (this.entities.genres.some(genre => input.includes(genre))) {
      intents.specifyingGenre = 0.75;
    }
    
    // Specifying activity intent
    if (this.entities.activities.some(activity => input.includes(activity))) {
      intents.specifyingActivity = 0.7;
    }
    
    // Rejection intent
    if (/(?:no|nope|not|don'?t|dislike|hate|bad|wrong|different|something else|not (?:that|this|those)|don'?t (?:like|want|enjoy))/i.test(input)) {
      intents.rejecting = 0.8;
    }
    
    // Affirmation intent
    if (/(?:yes|yeah|yep|sure|definitely|absolutely|correct|right|ok|okay|sounds? good|perfect|great|that'?s? (?:good|great|fine|perfect))/i.test(input)) {
      intents.affirming = 0.8;
    }
    
    // Question intent
    if (/(?:what|why|how|when|where|which|who|can you|could you|would you)\b.*\?/i.test(input) || input.endsWith('?')) {
      intents.questioning = 0.85;
    }
    
    // Gratitude intent
    if (/(?:thanks|thank you|thx|ty|appreciate|grateful)/i.test(input)) {
      intents.gratitude = 0.9;
    }
    
    // Confusion intent
    if (/(?:don'?t understand|confused|what do you mean|what'?s? (?:that|this)|what are you|huh\??|what\??)/i.test(input)) {
      intents.confused = 0.7;
    }
    
    // Consider the context from last response
    if (lastAIResponse) {
      // If we just asked about their mood and they respond without explicit mood keywords
      if (lastAIResponse.includes("How are you feeling") || lastAIResponse.includes("how you're feeling")) {
        intents.moodSharing += 0.3;
      }
      
      // If we just asked about genres and they respond with a short answer
      if (lastAIResponse.includes("kind of music") || lastAIResponse.includes("genres")) {
        intents.specifyingGenre += 0.3;
      }
      
      // If we just asked about activities and they respond with a short answer
      if (lastAIResponse.includes("activity") || lastAIResponse.includes("doing")) {
        intents.specifyingActivity += 0.3;
      }
    }
    
    return intents;
  }

  /**
   * Extract entities such as genres, artists, activities from input
   * @param {string} input - User's message
   * @returns {Object} Extracted entities
   */
  extractEntities(input) {
    const entities = {
      genres: [],
      activities: [],
      timeOfDay: [],
      artists: [] // Would need a much larger database or API call for comprehensive artist detection
    };
    
    // Extract genres
    this.entities.genres.forEach(genre => {
      if (input.includes(genre)) {
        entities.genres.push(genre);
      }
    });
    
    // Extract activities
    this.entities.activities.forEach(activity => {
      if (input.includes(activity)) {
        entities.activities.push(activity);
      }
    });
    
    // Extract time of day
    this.entities.timeOfDay.forEach(time => {
      if (input.includes(time)) {
        entities.timeOfDay.push(time);
      }
    });
    
    // Basic artist extraction (would be better with a comprehensive database)
    const artistPattern = /(?:like|love|enjoy|fan of|listen to) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g;
    const artistMatches = input.matchAll(artistPattern);
    for (const match of artistMatches) {
      if (match[1] && !entities.artists.includes(match[1])) {
        entities.artists.push(match[1]);
      }
    }
    
    return entities;
  }

  /**
   * Analyze mood from input text
   * @param {string} input - User's message
   * @returns {Object} Mood analysis with primary mood and confidence
   */
  analyzeMood(input) {
    // Leverage the enhanced MoodAnalyzer
    return MoodAnalyzer.analyzeMood([{ speaker: "You", text: input }]);
  }

  /**
   * Update the conversation context based on analysis
   * @param {Object} analysis - The analysis results
   */
  updateContext(analysis) {
    // Find the highest intent
    const primaryIntent = Object.entries(analysis.intents)
      .reduce((max, [intent, score]) => score > max.score ? {intent, score} : max, {intent: null, score: 0});
    
    // Update topic based on intent
    if (primaryIntent.score > 0.6) {
      if (primaryIntent.intent === 'greeting') {
        this.context.currentTopic = 'greeting';
      } else if (primaryIntent.intent === 'moodSharing') {
        this.context.currentTopic = 'moodExploration';
      } else if (primaryIntent.intent === 'askingForRecommendation' || primaryIntent.intent === 'specifyingGenre') {
        this.context.currentTopic = 'recommendation';
      } else if (primaryIntent.intent === 'specifyingActivity') {
        this.context.currentTopic = 'activityQuestion';
      } else if (primaryIntent.intent === 'confused') {
        this.context.currentTopic = 'clarification';
      } else if (primaryIntent.intent === 'gratitude') {
        this.context.followUpTopics.push('followUp');
      }
    }
    
    // Update detected moods
    if (analysis.moodAnalysis.mood && analysis.moodAnalysis.confidence > 0.3) {
      if (!this.context.detectedMoods.includes(analysis.moodAnalysis.mood)) {
        this.context.detectedMoods.unshift(analysis.moodAnalysis.mood);
      }
    }
    
    // Update mentioned genres
    if (analysis.entities.genres.length > 0) {
      analysis.entities.genres.forEach(genre => {
        if (!this.context.mentionedGenres.includes(genre)) {
          this.context.mentionedGenres.push(genre);
        }
      });
    }
    
    // Update mentioned artists
    if (analysis.entities.artists.length > 0) {
      analysis.entities.artists.forEach(artist => {
        if (!this.context.mentionedArtists.includes(artist)) {
          this.context.mentionedArtists.push(artist);
        }
      });
    }
    
    // Update user preferences based on activities
    if (analysis.entities.activities.length > 0) {
      this.context.userPreferences.activity = analysis.entities.activities[0];
    }
    
    // Update conversation stage based on information gathered
    if (this.context.detectedMoods.length > 0 && this.context.conversationStage === 'initial') {
      this.context.conversationStage = 'moodDetected';
    }
    
    if (this.context.detectedMoods.length > 0 && 
        (this.context.mentionedGenres.length > 0 || this.context.mentionedArtists.length > 0)) {
      this.context.conversationStage = 'preferencesGathered';
    }
    
    if (primaryIntent.intent === 'affirming' && this.context.conversationStage === 'preferencesGathered') {
      this.context.conversationStage = 'readyForRecommendations';
    }
    
    // Check if we've asked a question that hasn't been answered yet
    const lastAIMessage = this.context.conversationHistory
      .filter(msg => msg.speaker === "AI")
      .pop();
      
    this.context.questionAsked = lastAIMessage ? 
      lastAIMessage.text.endsWith('?') : false;
  }

  /**
   * Determine the next conversation move based on context
   * @returns {string} The next dialogue topic
   */
  determineNextMove() {
    // If this is the first interaction, start with a greeting
    if (this.context.conversationHistory.length === 0) {
      return 'greeting';
    }
    
    // If we've detected a mood but haven't explored it, do that next
    if (this.context.detectedMoods.length > 0 && 
        this.context.conversationStage === 'moodDetected' &&
        !this.context.questionAsked) {
      return 'moodExploration';
    }
    
    // If we have a mood but no genre preferences, ask about that
    if (this.context.detectedMoods.length > 0 && 
        this.context.mentionedGenres.length === 0 && 
        this.context.mentionedArtists.length === 0 &&
        !this.context.questionAsked) {
      return 'genreQuestion';
    }
    
    // If we have enough information, make recommendations
    if ((this.context.detectedMoods.length > 0 && 
         (this.context.mentionedGenres.length > 0 || this.context.mentionedArtists.length > 0)) ||
        this.context.conversationStage === 'readyForRecommendations') {
      return 'recommendation';
    }
    
    // If we're not sure about the user's mood or preferences, seek clarification
    if (this.context.currentTopic === 'confused' || 
        (this.context.conversationStage === 'initial' && this.context.conversationHistory.length > 2)) {
      return 'clarification';
    }
    
    // If we have follow-up topics queued, use those
    if (this.context.followUpTopics.length > 0) {
      return this.context.followUpTopics.shift();
    }
    
    // Default to the current topic if nothing else is triggered
    return this.context.currentTopic;
  }

  /**
   * Generate a contextually appropriate response
   * @param {string} dialogTopic - The dialogue topic to base response on
   * @returns {string} Generated response text
   */
  generateResponse(dialogTopic) {
    // Get potential responses for this topic
    const responses = this.dialogFlow[dialogTopic] || this.dialogFlow.greeting;
    
    // Select a response template
    let template = responses[Math.floor(Math.random() * responses.length)];
    
    // Fill in placeholders with contextual information
    if (template.includes('{mood}') && this.context.detectedMoods.length > 0) {
      template = template.replace(/{mood}/g, this.context.detectedMoods[0]);
    }
    
    if (template.includes('{genre}') && this.context.mentionedGenres.length > 0) {
      template = template.replace(/{genre}/g, this.context.mentionedGenres[0]);
    } else if (template.includes('{genre}')) {
      template = template.replace(/{genre}/g, 'music');
    }
    
    if (template.includes('{activity}') && this.context.userPreferences.activity) {
      template = template.replace(/{activity}/g, this.context.userPreferences.activity);
    } else if (template.includes('{activity}')) {
      template = template.replace(/{activity}/g, 'listening');
    }
    
    // Add conversational variety and personalization
    template = this.addConversationalElements(template);
    
    return template;
  }

  /**
   * Add conversational elements to make responses more natural
   * @param {string} response - Base response text
   * @returns {string} Enhanced response with conversational elements
   */
  addConversationalElements(response) {
    // Check for potential enhancers that would make sense
    const enhancers = [];
    const convoLength = this.context.conversationHistory.length;
    
    // For longer conversations, occasionally add acknowledgments
    if (convoLength > 3 && Math.random() > 0.7) {
      enhancers.push("I see. ");
      enhancers.push("Got it. ");
      enhancers.push("I understand. ");
      enhancers.push("Interesting. ");
    }
    
    // For very engaged conversations, add enthusiasm
    if (convoLength > 5 && Math.random() > 0.8) {
      enhancers.push("I'm really enjoying our conversation! ");
      enhancers.push("This is helping me understand your music needs better. ");
    }
    
    // If we have a detected mood with high confidence, occasionally acknowledge it
    if (this.context.detectedMoods.length > 0 && Math.random() > 0.7) {
      enhancers.push(`It sounds like you're feeling ${this.context.detectedMoods[0]}. `);
    }
    
    // If multiple genres were mentioned, acknowledge the range
    if (this.context.mentionedGenres.length > 1 && Math.random() > 0.7) {
      enhancers.push(`You seem to enjoy a variety of music like ${this.context.mentionedGenres.slice(0, 2).join(' and ')}. `);
    }
    
    // Select an enhancer if we have any
    if (enhancers.length > 0) {
      const enhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
      // Add the enhancer to the beginning of the response
      return enhancer + response;
    }
    
    return response;
  }

  /**
   * Generate a conclusive response when ending conversation
   * @param {string} dominantMood - Main detected mood
   * @returns {string} A conclusion message
   */
  generateConclusion(dominantMood) {
    const conclusions = [
      `Based on our conversation, I think you're feeling ${dominantMood}. Here are some songs that might match your mood!`,
      `I've analyzed our chat and it seems like you're in a ${dominantMood} mood. Let me recommend some music that complements this feeling.`,
      `From what we've discussed, your mood seems ${dominantMood}. I've selected some tracks that should resonate with how you're feeling.`,
      `I've gathered that you're feeling ${dominantMood} right now. Here's a selection of music that might be perfect for your current state of mind.`
    ];
    
    // Add personalization if we have genre preferences
    if (this.context.mentionedGenres.length > 0) {
      const genreConclusions = [
        `Since you mentioned liking ${this.context.mentionedGenres.join(' and ')}, I've focused on finding ${dominantMood} songs in those genres.`,
        `I've found some ${dominantMood} ${this.context.mentionedGenres[0]} music that I think you'll enjoy based on our conversation.`
      ];
      
      conclusions.push(...genreConclusions);
    }
    
    // Add personalization if we have artist preferences
    if (this.context.mentionedArtists.length > 0) {
      const artistConclusions = [
        `I've included some tracks similar to ${this.context.mentionedArtists[0]} that match your ${dominantMood} mood.`,
        `Based on your interest in ${this.context.mentionedArtists.join(' and ')}, I think these ${dominantMood} songs will be perfect for you.`
      ];
      
      conclusions.push(...artistConclusions);
    }
    
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  }
}

export default new ConversationEngine();