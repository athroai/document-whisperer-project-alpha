
  const sendMessage = async (content: string) => {
    if (!activeCharacter || !content.trim()) return;

    // Add user message
    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Temporary hardcoded OpenAI API key for direct usage
      const openAIApiKey = "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";
      
      // Call OpenAI with the API key
      const response = await getOpenAIResponse({
        systemPrompt: `You are ${activeCharacter.name}, an AI mentor for ${activeCharacter.subject}. Respond helpfully and professionally.`,
        userMessage: content,
        apiKey: openAIApiKey
      });
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, athroResponse]);
    } catch (error) {
      console.error("Error getting Athro response:", error);
      
      // Add fallback message
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
