const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const { getGenkitInstance } = require('./genkit-modern-service');
const { getUserData } = require('./genkit-modern-service');
const { personalizeResponse } = require('./realtime-personalization');
const { logAIInteraction } = require('./realtime-personalization');
const vision = require('@google-cloud/vision');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const { Storage } = require('@google-cloud/storage');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Initialize clients
const visionClient = new vision.ImageAnnotatorClient();
const documentClient = new DocumentProcessorServiceClient();
const storage = new Storage();

// System prompt for RAG-based responses
const RAG_SYSTEM_PROMPT = `You are BlinderFit AI, a fitness and nutrition expert with the ability to analyze images and documents.
Answer user questions PRECISELY and DIRECTLY based on what they ask and the content of their uploaded files.
Format your response in three sections:
1) MAIN ANSWER: Provide a clear, direct answer to the exact question asked, referencing the uploaded content.
2) ADDITIONAL INFO: Include relevant scientific context and information.
3) PERSONALIZED TIPS: Offer actionable advice specific to the question topic and uploaded content.`;

/**
 * Extract text from an image using Google Cloud Vision API
 */
async function extractTextFromImage(imageUrl) {
  try {
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    // Detect text in the image
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    
    if (detections && detections.length > 0) {
      return detections[0].description;
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
}

/**
 * Extract text from a document using Google Cloud Document AI
 */
async function extractTextFromDocument(documentUrl, documentType) {
  try {
    // Download the document
    const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });
    const documentBuffer = Buffer.from(response.data, 'binary');
    
    // Process based on document type
    if (documentType === 'application/pdf') {
      // Use Document AI for PDFs
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      const location = 'us';
      const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
      
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
      
      const request = {
        name,
        rawDocument: {
          content: documentBuffer.toString('base64'),
          mimeType: 'application/pdf',
        },
      };
      
      const [result] = await documentClient.processDocument(request);
      return result.document.text;
    } else {
      // For text files, just return the content
      return documentBuffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Error extracting text from document:', error);
    return '';
  }
}

/**
 * Process files and extract content
 */
async function processFiles(files) {
  const extractedContents = [];
  
  for (const file of files) {
    try {
      let content = '';
      
      if (file.type === 'image') {
        content = await extractTextFromImage(file.url);
        extractedContents.push({
          fileName: file.name,
          fileType: 'image',
          content: content
        });
      } else if (file.type === 'document') {
        content = await extractTextFromDocument(file.url, file.mimeType || 'application/pdf');
        extractedContents.push({
          fileName: file.name,
          fileType: 'document',
          content: content
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return extractedContents;
}

/**
 * Process files and answer questions using RAG
 */
exports.processFilesAndAnswer = functions.https.onCall(async (data, context) => {
  // Extract question, files, and chat history
  const { question, files, chatHistory = [] } = data;
  
  // Validate
  if (!question) {
    console.error("Invalid request: missing question");
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Question is required'
    );
  }
  
  if (!files || !Array.isArray(files) || files.length === 0) {
    console.error("Invalid request: missing files");
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Files are required'
    );
  }
  
  console.log(`Processing question with ${files.length} files and ${chatHistory.length} history messages: "${question}"`);
  
  try {
    // Get user data for personalization if authenticated
    let userData = null;
    let userContext = '';
    let userId = null;
    
    if (context.auth) {
      userId = context.auth.uid;
      console.log(`Authenticated user: ${userId}`);
      userData = await getUserData(userId);
      
      if (userData) {
        userContext = `User Profile: ${JSON.stringify(userData.profile || {})}
        Assessment Data: ${JSON.stringify(userData.assessmentData || {})}
        Recent Progress: ${JSON.stringify(userData.progressData || [])}`;
        
        console.log(`Retrieved personalization data for user ${userId}`);
      }
    }
    
    // Process files to extract content
    console.log("Processing uploaded files...");
    const extractedContents = await processFiles(files);
    console.log(`Extracted content from ${extractedContents.length} files`);
    
    // Format the extracted content
    const formattedContent = extractedContents.map(item => 
      `File: ${item.fileName} (${item.fileType})
Content: ${item.content}`
    ).join('\n\n');
    
    // Format chat history if available
    let formattedChatHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      formattedChatHistory = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
      
      console.log(`Formatted chat history with ${chatHistory.length} messages`);
    }
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Create the prompt for RAG-based response
    const prompt = `
Question: ${question}
${formattedChatHistory ? `\nChat History:\n${formattedChatHistory}` : ''}
${userContext ? `\nUser Context:\n${userContext}` : ''}

Extracted Content from Uploaded Files:
${formattedContent}

Based on the question and the content extracted from the uploaded files, provide a detailed and accurate answer.
If the files don't contain relevant information to answer the question, acknowledge this and provide the best answer based on your knowledge.
If chat history is provided, use it to provide context-aware responses that build on previous interactions.

Format your response in three sections:
1. MAIN ANSWER: A direct, comprehensive answer to the question based on the uploaded files
2. ADDITIONAL INFO: Relevant scientific or contextual information
3. PERSONALIZED TIPS: Actionable advice based on the user's profile and the uploaded content
`;
    
    // Generate the response
    console.log("Generating RAG-based response...");
    const { text } = await ai.generate(prompt, {
      systemPrompt: RAG_SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 1500,
    });
    
    // Parse the structured response
    const mainAnswerMatch = text.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = text.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = text.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    const structuredAnswer = {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : text,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
    
    // Personalize the response if user data is available
    let personalizedAnswer = structuredAnswer;
    if (userData) {
      // Apply real-time personalization to each section
      personalizedAnswer = {
        mainAnswer: await personalizeResponse(structuredAnswer.mainAnswer, userData),
        additionalInfo: structuredAnswer.additionalInfo,
        personalizedTips: await personalizeResponse(structuredAnswer.personalizedTips, userData)
      };
      
      // Log the interaction for continuous improvement
      if (userId) {
        await logAIInteraction(userId, {
          prompt: question,
          responseType: 'rag_question',
          metadata: { 
            fileCount: files.length,
            fileTypes: files.map(f => f.type),
            hadChatHistory: chatHistory.length > 0
          }
        });
      }
    }
    
    // Structure the response
    const response = {
      answer: personalizedAnswer,
      fromCache: false,
      timestamp: new Date().toISOString(),
      personalized: !!userData,
      questionAsked: question,
      filesProcessed: files.length,
      usedChatHistory: chatHistory.length > 0
    };
    
    // Log the interaction if user is authenticated
    if (context.auth) {
      await admin.firestore().collection('ai_queries').add({
        userId: context.auth.uid,
        question,
        fileCount: files.length,
        fileTypes: files.map(f => f.type),
        chatHistoryLength: chatHistory.length,
        response,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error processing files and answering question:", error);
    
    return {
      answer: {
        mainAnswer: `Sorry, I couldn't process your question about "${question}" with the uploaded files right now.`,
        additionalInfo: "Our AI service encountered an error while processing your files. Please try again later.",
        personalizedTips: "If the issue persists, try uploading different file formats or rephrasing your question."
      },
      error: true,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
  }
});

/**
 * Process images for nutrition analysis
 */
exports.analyzeNutritionImage = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to analyze nutrition images'
    );
  }
  
  // Extract image data
  const { imageUrl, question = "What's the nutritional content of this food?" } = data;
  
  if (!imageUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image URL is required'
    );
  }
  
  try {
    // Get user data for personalization
    const userId = context.auth.uid;
    const userData = await getUserData(userId);
    
    // Extract text from the image
    console.log("Extracting text from nutrition image...");
    const extractedText = await extractTextFromImage(imageUrl);
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Create specialized prompt for nutrition analysis
    const nutritionPrompt = `
Analyze this food image and extracted text to answer: ${question}

Extracted Text from Image:
${extractedText}

User Context:
${userData ? JSON.stringify(userData.profile || {}) : 'No user data available'}

Provide a detailed nutritional analysis of the food in the image.
If the image contains a nutrition label, extract the key nutritional information.
If it's a food item without a label, estimate its nutritional content.

Format your response in three sections:
1. MAIN ANSWER: A direct answer about the nutritional content
2. ADDITIONAL INFO: Relevant health and nutrition information
3. PERSONALIZED TIPS: Dietary recommendations based on this food and the user's profile
`;
    
    // Generate the response
    console.log("Generating nutrition analysis...");
    const { text } = await ai.generate(nutritionPrompt, {
      systemPrompt: "You are BlinderFit AI, a nutrition expert specializing in analyzing food images and nutrition labels. Provide accurate, detailed nutritional information and personalized dietary advice.",
      temperature: 0.2,
      maxOutputTokens: 1000,
    });
    
    // Parse the structured response
    const mainAnswerMatch = text.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = text.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = text.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    const structuredAnswer = {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : text,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
    
    // Personalize the response if user data is available
    let personalizedAnswer = structuredAnswer;
    if (userData) {
      personalizedAnswer = {
        mainAnswer: await personalizeResponse(structuredAnswer.mainAnswer, userData),
        additionalInfo: structuredAnswer.additionalInfo,
        personalizedTips: await personalizeResponse(structuredAnswer.personalizedTips, userData)
      };
      
      // Log the interaction
      await logAIInteraction(userId, {
        prompt: question,
        responseType: 'nutrition_analysis',
        metadata: { 
          imageAnalysis: true
        }
      });
    }
    
    // Log the analysis to Firestore
    await admin.firestore().collection('nutrition_analyses').add({
      userId,
      imageUrl,
      question,
      extractedText,
      analysis: personalizedAnswer,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      answer: personalizedAnswer,
      extractedText,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error analyzing nutrition image:", error);
    
    return {
      answer: {
        mainAnswer: "Sorry, I couldn't analyze the nutritional content of this image right now.",
        additionalInfo: "Our image analysis service encountered an error. Please try again with a clearer image.",
        personalizedTips: "For best results, try taking photos with good lighting and make sure any text is clearly visible."
      },
      error: true,
      timestamp: new Date().toISOString()
    };
  }
});

/**
 * Process workout plan documents
 */
exports.analyzeWorkoutPlan = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to analyze workout plans'
    );
  }
  
  // Extract document data
  const { documentUrl, documentType, question = "Analyze this workout plan and provide feedback" } = data;
  
  if (!documentUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Document URL is required'
    );
  }
  
  try {
    // Get user data for personalization
    const userId = context.auth.uid;
    const userData = await getUserData(userId);
    
    // Extract text from the document
    console.log("Extracting text from workout plan document...");
    const extractedText = await extractTextFromDocument(documentUrl, documentType);
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Create specialized prompt for workout plan analysis
    const workoutPrompt = `
Analyze this workout plan document to answer: ${question}

Extracted Text from Document:
${extractedText}

User Context:
${userData ? JSON.stringify(userData.profile || {}) : 'No user data available'}
${userData ? JSON.stringify(userData.assessmentData || {}) : ''}

Provide a detailed analysis of the workout plan in the document.
Evaluate its effectiveness, appropriateness for the user, and suggest improvements.

Format your response in three sections:
1. MAIN ANSWER: A direct analysis of the workout plan
2. ADDITIONAL INFO: Relevant fitness and exercise science information
3. PERSONALIZED TIPS: Recommendations to improve or adapt the plan based on the user's profile
`;
    
    // Generate the response
    console.log("Generating workout plan analysis...");
    const { text } = await ai.generate(workoutPrompt, {
      systemPrompt: "You are BlinderFit AI, a fitness expert specializing in analyzing and optimizing workout plans. Provide accurate, detailed analysis and personalized recommendations.",
      temperature: 0.2,
      maxOutputTokens: 1200,
    });
    
    // Parse the structured response
    const mainAnswerMatch = text.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = text.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = text.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    const structuredAnswer = {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : text,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
    
    // Personalize the response if user data is available
    let personalizedAnswer = structuredAnswer;
    if (userData) {
      personalizedAnswer = {
        mainAnswer: await personalizeResponse(structuredAnswer.mainAnswer, userData),
        additionalInfo: structuredAnswer.additionalInfo,
        personalizedTips: await personalizeResponse(structuredAnswer.personalizedTips, userData)
      };
      
      // Log the interaction
      await logAIInteraction(userId, {
        prompt: question,
        responseType: 'workout_analysis',
        metadata: { 
          documentAnalysis: true
        }
      });
    }
    
    // Log the analysis to Firestore
    await admin.firestore().collection('workout_analyses').add({
      userId,
      documentUrl,
      documentType,
      question,
      extractedText,
      analysis: personalizedAnswer,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      answer: personalizedAnswer,
      extractedText,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error analyzing workout plan:", error);
    
    return {
      answer: {
        mainAnswer: "Sorry, I couldn't analyze this workout plan document right now.",
        additionalInfo: "Our document analysis service encountered an error. Please try again with a different format.",
        personalizedTips: "For best results, try uploading PDF documents with clear text formatting."
      },
      error: true,
      timestamp: new Date().toISOString()
    };
  }
});

