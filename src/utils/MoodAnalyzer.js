// utils/MoodAnalyzer.js

/**
 * Advanced mood analysis system that combines lexical, contextual, and semantic
 * approaches to accurately determine a user's emotional state
 */
class MoodAnalyzer {
    // Expanded mood keyword dictionaries
    static MOOD_KEYWORDS = {
      happy: [
        "happy", "great", "excited", "joy", "wonderful", "amazing", "cheerful", 
        "delighted", "pleased", "content", "good", "ecstatic", "thrilled", 
        "overjoyed", "blissful", "glad", "jubilant", "elated", "upbeat", "fantastic",
        "terrific", "excellent", "joyful", "cheery", "jolly", "lively", "positive",
        "uplifted", "blessed", "loving", "merry", "optimistic", "pleasant", "sunny",
        "thriving", "beaming", "celebratory", "gleeful", "gratified", "radiant"
      ],
      sad: [
        "sad", "down", "depressed", "unhappy", "blue", "melancholy", "gloomy", 
        "miserable", "heartbroken", "disappointed", "upset", "sorrow", "grief", 
        "dejected", "hopeless", "despondent", "somber", "tearful", "dismal", "lousy",
        "terrible", "horrible", "awful", "dreadful", "weary", "woeful", "broken",
        "crushed", "defeated", "forlorn", "hurt", "mournful", "painful", "woeful",
        "anguished", "desolate", "devastated", "distressed", "downcast", "low",
        "sullen", "troubled", "alone", "abandoned", "lost", "lonely", "neglected"
      ],
      angry: [
        "angry", "mad", "furious", "irritated", "annoyed", "frustrated", "enraged",
        "hostile", "irate", "outraged", "agitated", "bitter", "exasperated", "fuming",
        "indignant", "infuriated", "irked", "offended", "resentful", "vexed", "cross",
        "displeased", "heated", "inflamed", "provoked", "riled", "antagonized",
        "livid", "seething", "upset", "disgusted", "fed up", "ticked off"
      ],
      anxious: [
        "anxious", "nervous", "worried", "stressed", "uneasy", "apprehensive", 
        "concerned", "distressed", "frightened", "jittery", "panicky", "tense", 
        "afraid", "alarmed", "troubled", "restless", "agitated", "frantic", "on edge",
        "overwhelmed", "perturbed", "rattled", "strained", "threatened", "unsettled",
        "disturbed", "uncomfortable", "wary", "pressured", "flustered", "jumpy"
      ],
      energetic: [
        "energetic", "pumped", "motivated", "energized", "active", "dynamic", 
        "lively", "vibrant", "vigorous", "enthusiastic", "peppy", "spirited", 
        "hyper", "wired", "invigorated", "zesty", "animated", "vital", "stimulated",
        "charged", "electric", "fired up", "full of energy", "inspired", "passionate",
        "powerful", "strong", "driven", "determined", "eager", "ready", "alive"
      ],
      calm: [
        "calm", "peaceful", "relaxed", "chill", "tranquil", "serene", "composed", 
        "quiet", "still", "soothing", "mellow", "zen", "balanced", "centered", 
        "placid", "untroubled", "gentle", "easy-going", "harmonious", "at ease",
        "comfortable", "content", "cool", "collected", "level-headed", "mindful",
        "restful", "settled", "steady", "undisturbed", "unruffled", "unwound",
        "grounded", "meditative", "poised", "secure", "stable", "carefree"
      ],
      tired: [
        "tired", "exhausted", "sleepy", "fatigued", "weary", "drained", "spent",
        "beat", "burned out", "worn out", "drowsy", "lethargic", "sluggish", "weak",
        "depleted", "enervated", "run-down", "sapped", "tuckered out", "dead tired",
        "dog-tired", "knackered", "bushed", "done in", "pooped", "wiped out"
      ],
      bored: [
        "bored", "uninterested", "indifferent", "apathetic", "disinterested", 
        "unconcerned", "detached", "disconnected", "dispassionate", "listless",
        "uninspired", "weary", "jaded", "unenthusiastic", "unexcited", "ho-hum",
        "mundane", "tedious", "monotonous", "dull", "lifeless", "unengaged", 
        "unmotivated", "unstimulated", "checked out", "spaced out"
      ],
      neutral: [
        "okay", "alright", "fine", "normal", "so-so", "average", "moderate", 
        "ordinary", "balanced", "regular", "neutral", "indifferent", "unchanged", 
        "stable", "acceptable", "decent", "fair", "reasonable", "satisfactory",
        "tolerable", "mediocre", "middling", "usual", "common", "standard", "typical"
      ]
    };
  
    // Expanded intensity modifiers and their weights
    static INTENSITY_MODIFIERS = {
      "very": 2,
      "extremely": 2.5,
      "really": 1.8,
      "so": 1.8,
      "incredibly": 2.5,
      "absolutely": 2.5,
      "totally": 2,
      "quite": 1.5,
      "fairly": 1.3,
      "rather": 1.4,
      "pretty": 1.5,
      "somewhat": 0.7,
      "a bit": 0.6,
      "a little": 0.5,
      "slightly": 0.5,
      "mildly": 0.6,
      "kinda": 0.7,
      "sort of": 0.6,
      "hardly": -0.7,
      "barely": -0.8,
      "not very": -0.5,
      "not particularly": -0.6,
      "not": -1,
      "don't feel": -1,
      "not at all": -1.5,
      "couldn't be more": 2.7,
      "beyond": 2.6,
      "super": 2.2,
      "ridiculously": 2.3,
      "unbelievably": 2.4,
      "just": 0.8,
    };
  
    // Compound emotion patterns that map to primary moods
    static COMPOUND_EMOTIONS = {
      "bittersweet": { moods: ["happy", "sad"], weights: [0.5, 0.5] },
      "nervous excitement": { moods: ["anxious", "energetic"], weights: [0.6, 0.4] },
      "anxious but hopeful": { moods: ["anxious", "happy"], weights: [0.6, 0.4] },
      "calm but sad": { moods: ["calm", "sad"], weights: [0.6, 0.4] },
      "angry and frustrated": { moods: ["angry", "energetic"], weights: [0.7, 0.3] },
      "tired but happy": { moods: ["tired", "happy"], weights: [0.5, 0.5] },
      "relaxed and content": { moods: ["calm", "happy"], weights: [0.6, 0.4] },
      "emotionally drained": { moods: ["tired", "sad"], weights: [0.6, 0.4] },
      "anxious and tired": { moods: ["anxious", "tired"], weights: [0.6, 0.4] },
      "motivated but stressed": { moods: ["energetic", "anxious"], weights: [0.5, 0.5] }
    };
  
    // Contextual phrases that indicate specific moods
    static CONTEXTUAL_PHRASES = [
      { phrase: "having a great day", moods: { happy: 1.5 } },
      { phrase: "having a bad day", moods: { sad: 1.5 } },
      { phrase: "things are going well", moods: { happy: 1.2 } },
      { phrase: "nothing's going right", moods: { sad: 1.2 } },
      { phrase: "everything's falling apart", moods: { sad: 1.8, anxious: 0.7 } },
      { phrase: "on top of the world", moods: { happy: 2.0 } },
      { phrase: "under a lot of pressure", moods: { anxious: 1.5 } },
      { phrase: "at my wits' end", moods: { frustrated: 1.8, tired: 0.8 } },
      { phrase: "couldn't be better", moods: { happy: 2.0 } },
      { phrase: "never been worse", moods: { sad: 2.0 } },
      { phrase: "stressed out", moods: { anxious: 1.8 } },
      { phrase: "need to calm down", moods: { anxious: 1.2, energetic: 0.8 } },
      { phrase: "need to relax", moods: { anxious: 1.0, energetic: 0.6 } },
      { phrase: "lost my mind", moods: { anxious: 1.3, frustrated: 1.0 } },
      { phrase: "over the moon", moods: { happy: 2.0 } },
      { phrase: "down in the dumps", moods: { sad: 1.5 } },
      { phrase: "walking on air", moods: { happy: 1.8 } },
      { phrase: "heart is heavy", moods: { sad: 1.5 } },
      { phrase: "weight off my shoulders", moods: { calm: 1.2, happy: 0.8 } },
      { phrase: "weight on my shoulders", moods: { anxious: 1.2, sad: 0.7 } },
      { phrase: "at peace", moods: { calm: 1.5 } },
      { phrase: "climbing the walls", moods: { energetic: 1.4, anxious: 1.0 } },
      { phrase: "burning out", moods: { tired: 1.5, sad: 0.6 } },
      { phrase: "falling apart", moods: { sad: 1.4, anxious: 1.0 } },
      { phrase: "on cloud nine", moods: { happy: 1.8 } },
      { phrase: "bouncing off the walls", moods: { energetic: 1.8 } },
      { phrase: "dead inside", moods: { sad: 1.8, bored: 0.7 } },
      { phrase: "full of life", moods: { energetic: 1.5, happy: 1.0 } }
    ];
  
    /**
     * Advanced mood analysis using multifaceted approach
     * @param {Array} transcript - Array of transcript objects with speaker and text
     * @returns {Object} Object containing dominant mood, confidence, and detailed scores
     */
    static analyzeMood(transcript) {
      // Extract user messages from transcript
      const userMessages = transcript
        .filter(msg => msg.speaker === "You")
        .map(msg => msg.text.toLowerCase());
      
      // Join all user messages
      const text = userMessages.join(' ');
      
      // Initialize mood scores with all possible moods
      let moodScores = {};
      Object.keys(this.MOOD_KEYWORDS).forEach(mood => {
        moodScores[mood] = 0;
      });
      
      // Add missing keys for compound emotions
      Object.values(this.COMPOUND_EMOTIONS).forEach(compound => {
        compound.moods.forEach(mood => {
          if (!moodScores.hasOwnProperty(mood)) {
            moodScores[mood] = 0;
          }
        });
      });
      
      // 1. Analyze direct mood keywords
      this.analyzeKeywords(text, moodScores);
      
      // 2. Check for compound emotions
      this.analyzeCompoundEmotions(text, moodScores);
      
      // 3. Analyze contextual phrases
      this.analyzeContextualPhrases(text, moodScores);
      
      // 4. Apply negation analysis
      this.analyzeNegations(text, moodScores);
      
      // 5. Check for intensity over time if multiple messages
      if (userMessages.length > 1) {
        this.analyzeIntensityOverTime(userMessages, moodScores);
      }
      
      // Find the mood with the highest score
      let dominantMood = "neutral";
      let highestScore = 0;
      
      Object.entries(moodScores).forEach(([mood, score]) => {
        if (score > highestScore) {
          dominantMood = mood;
          highestScore = score;
        }
      });
      
      // Calculate confidence (0-1)
      const totalAbsScore = Object.values(moodScores).reduce((sum, score) => sum + Math.abs(score), 0);
      const confidence = totalAbsScore > 0 ? highestScore / totalAbsScore : 0;
      
      // If no strong mood detected or confidence is too low, default to neutral
      if (highestScore <= 0.5 || confidence < 0.3) {
        dominantMood = "neutral";
      }
      
      // Return the analysis with detailed scores
      return {
        mood: dominantMood,
        confidence: Math.min(confidence, 1), // Cap confidence at 1.0
        scores: moodScores,
        
        // Include secondary mood if it's close to the primary
        secondaryMood: this.getSecondaryMood(moodScores, dominantMood, highestScore)
      };
    }
  
    /**
     * Analyze text for direct mood keywords
     * @param {string} text - Processed text input
     * @param {Object} moodScores - Mood scores object to update
     */
    static analyzeKeywords(text, moodScores) {
      Object.entries(this.MOOD_KEYWORDS).forEach(([mood, keywords]) => {
        keywords.forEach(keyword => {
          // Create regex to find the keyword and possible modifiers before it
          const regex = new RegExp(`(\\b(${Object.keys(this.INTENSITY_MODIFIERS).join('|')})\\s+)?\\b${keyword}\\b`, 'gi');
          
          // Find all matches
          const matches = [...text.matchAll(regex)];
          
          matches.forEach(match => {
            // Base score for finding the keyword
            let score = 1;
            
            // If there's a modifier, adjust the score
            const modifier = match[1]?.trim().toLowerCase();
            if (modifier && this.INTENSITY_MODIFIERS[modifier]) {
              score *= this.INTENSITY_MODIFIERS[modifier];
            }
            
            // Add to the mood's score
            moodScores[mood] += score;
          });
        });
      });
    }
  
    /**
     * Analyze text for compound emotions
     * @param {string} text - Processed text input
     * @param {Object} moodScores - Mood scores object to update
     */
    static analyzeCompoundEmotions(text, moodScores) {
      Object.entries(this.COMPOUND_EMOTIONS).forEach(([compoundName, data]) => {
        if (text.includes(compoundName)) {
          // Apply the compound emotion's weights to the corresponding moods
          data.moods.forEach((mood, index) => {
            moodScores[mood] += data.weights[index] * 1.5; // Boost for explicit compound emotions
          });
        }
      });
    }
  
    /**
     * Analyze text for contextual phrases indicating moods
     * @param {string} text - Processed text input
     * @param {Object} moodScores - Mood scores object to update
     */
    static analyzeContextualPhrases(text, moodScores) {
      this.CONTEXTUAL_PHRASES.forEach(item => {
        if (text.includes(item.phrase)) {
          // Apply scores for all moods associated with this phrase
          Object.entries(item.moods).forEach(([mood, score]) => {
            if (moodScores.hasOwnProperty(mood)) {
              moodScores[mood] += score;
            }
          });
        }
      });
    }
  
    /**
     * Analyze text for negations that affect mood detection
     * @param {string} text - Processed text input
     * @param {Object} moodScores - Mood scores object to update
     */
    static analyzeNegations(text, moodScores) {
      // Check for general negations of emotions
      Object.keys(this.MOOD_KEYWORDS).forEach(mood => {
        const negationPattern = new RegExp(`\\b(not|don'?t|isn'?t|aren'?t|wasn'?t|haven'?t|hasn'?t|won'?t|can'?t|couldn'?t|shouldn'?t|wouldn'?t)\\b [\\w\\s]{0,10}\\b(${this.MOOD_KEYWORDS[mood].join('|')})\\b`, 'gi');
        
        const matches = [...text.matchAll(negationPattern)];
        matches.forEach(() => {
          // Reduce this mood's score and potentially increase its opposite
          moodScores[mood] -= 1.5;
          
          // Potentially increase opposite emotion scores
          if (mood === 'happy') {
            moodScores['sad'] += 0.7;
          } else if (mood === 'sad') {
            moodScores['neutral'] += 0.7;
          } else if (mood === 'energetic') {
            moodScores['tired'] += 0.7;
          } else if (mood === 'calm') {
            moodScores['anxious'] += 0.7;
          } else if (mood === 'anxious') {
            moodScores['calm'] += 0.7;
          }
        });
      });
      
      // Check for explicit statements about not feeling a certain way
      const notFeelingPattern = /\b(don'?t|do not|doesn'?t|does not) (feel|feeling)\b [a-z\s]{0,15}\b(happy|sad|angry|anxious|calm|energetic|tired|bored)\b/gi;
      const notFeelingMatches = [...text.matchAll(notFeelingPattern)];
      
      notFeelingMatches.forEach(match => {
        const emotion = match[3].toLowerCase();
        if (moodScores.hasOwnProperty(emotion)) {
          moodScores[emotion] -= 2.0; // Stronger reduction for explicit denial
        }
      });
    }
  
    /**
     * Analyze intensity changes over multiple messages
     * @param {Array} messages - Array of user message strings
     * @param {Object} moodScores - Mood scores object to update
     */
    static analyzeIntensityOverTime(messages, moodScores) {
      // This analysis only makes sense with multiple messages
      if (messages.length < 2) return;
      
      // Check the most recent message for strong intensifiers
      const recentMessage = messages[messages.length - 1];
      
      // Check for escalation words in recent message
      const escalationWords = [
        "really", "extremely", "incredibly", "very", "so", "much more", 
        "getting worse", "even more", "becoming", "increasingly"
      ];
      
      // If we find escalation words in recent messages, intensify the dominant moods
      for (const word of escalationWords) {
        if (recentMessage.includes(word)) {
          // Find the top two moods
          const sortedMoods = Object.entries(moodScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);
          
          // Intensify these moods
          sortedMoods.forEach(([mood, score]) => {
            if (score > 0) {
              moodScores[mood] *= 1.2; // 20% boost for time-based intensity
            }
          });
          
          break; // Only apply this once if we find any escalation word
        }
      }
    }
  
    /**
     * Get the secondary mood if there is one that's close to the primary
     * @param {Object} scores - Mood scores object
     * @param {string} primaryMood - The identified primary mood
     * @param {number} primaryScore - The score of the primary mood
     * @returns {Object|null} Secondary mood data or null
     */
    static getSecondaryMood(scores, primaryMood, primaryScore) {
      // Find the second highest score
      let secondaryMood = null;
      let secondaryScore = 0;
      
      Object.entries(scores).forEach(([mood, score]) => {
        if (mood !== primaryMood && score > secondaryScore) {
          secondaryMood = mood;
          secondaryScore = score;
        }
      });
      
      // Only return secondary mood if it's at least 70% as strong as primary
      if (secondaryMood && secondaryScore >= primaryScore * 0.7) {
        return {
          mood: secondaryMood,
          score: secondaryScore
        };
      }
      
      return null;
    }
  }
  
  export default MoodAnalyzer;
  
