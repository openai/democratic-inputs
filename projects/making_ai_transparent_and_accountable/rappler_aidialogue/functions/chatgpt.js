const {ChatOpenAI} = require("langchain/chat_models/openai");
const {BufferMemory} = require("langchain/memory");
const {FirestoreChatMessageHistory} =
  require("langchain/stores/message/firestore");
const {ConversationChain} = require("langchain/chains");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} = require("langchain/prompts");

const logger = require("firebase-functions/logger");
const {Timestamp} = require("firebase-admin/firestore");


const _extractPolicies = (response) => {
  logger.debug("extractPolicies start.");

  const policies = [];
  const jsonObj = JSON.parse(response);

  Object.keys(jsonObj).forEach((key) =>{
    const value = jsonObj[key];
    if (Array.isArray(value)) {
      value.forEach((element, index) => {
        policies.push(`${element} (${key})`);
      });
    } else if (typeof value === "object" && value !== null) {
      // At this point, I give up, just stringify
      policies.push(`${JSON.stringify(value)} (${key})`);
    } else {
      policies.push(`${value} (${key})`);
    }
  });

  return policies;
};

exports.sendPolicyPrompt = async (promptDocData, db) => {
  logger.debug(`sendPolicyPrompt start. ${JSON.stringify(promptDocData)}`);

  let policyCheckHeaderId = "";
  const policyCheckHeaders = await db.collection("questions")
      .where("session", "==", promptDocData.session)
      .where("type", "==", "policycheckheader")
      .orderBy("seq", "asc")
      .limit(1)
      .get();

  if (policyCheckHeaders.docs[0]) {
    policyCheckHeaderId = policyCheckHeaders.docs[0].id;
    if (!policyCheckHeaders.docs[0].data().visible) {
      policyCheckHeaders.docs[0].ref.update({
        visible: true,
      });
    }
  } else {
    const question = "Please thumbs up or thumbs down the policies " +
        "generated by the AI from your responses";
    const newHeader = await db.collection("questions").add({
      question: question,
      session: promptDocData.session,
      seq: 1,
      createdAt: Timestamp.now(),
      type: "policycheckheader",
      visible: true,
    });
    policyCheckHeaderId = newHeader.id;
  }
  // Delete previously generated policies
  const policyChecks = await db.collection("questions")
      .where("parentId", "==", policyCheckHeaderId)
      .get();

  policyChecks.forEach((doc) => {
    doc.ref.delete();
  });

  const chat = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.3,
    // maxRetries: 3,
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(promptDocData.systemMessage),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    llm: chat,
    prompt: chatPrompt,
  });

  logger.info("Calling chatgpt to generate policies.");

  const chatResponse = await chain.call({
    input: promptDocData.humanMessage,
  });

  try {
    const response = chatResponse.response;
    const policies = _extractPolicies(response);

    for (let i = 0; i < policies.length; i++) {
      await db.collection("questions").add({
        question: policies[i],
        type: "policycheck",
        parentId: policyCheckHeaderId,
        session: promptDocData.session,
        seq: i + 1,
        createdAt: Timestamp.now(),
        visible: true,
      });
    }

    return response;
  } catch (error) {
    logger.error(`sendPolicyPrompt error: ${error}`);
    return;
  }
};

exports.sendSummaryPrompt = async (promptDocData, db) => {
  logger.debug(`sendSummaryPrompt start. ${JSON.stringify(promptDocData)}`);

  const chat = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.3,
    // maxRetries: 3,
  });

  const memory = new BufferMemory({
    chatHistory: new FirestoreChatMessageHistory({
      collectionName: "summaryhistory",
      sessionId: promptDocData.questionId,
      userId: "openai-experiments@rappler.com",
    }),
    returnMessages: true,
    memoryKey: "summaryhistory",
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(promptDocData.systemMessage),
    new MessagesPlaceholder("summaryhistory"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: memory,
    llm: chat,
    prompt: chatPrompt,
  });

  logger.info("Calling chatgpt to generate summary.");

  try {
    const chatResponse = await chain.call({
      input: promptDocData.humanMessage,
    });

    const response = chatResponse.response;

    await db.collection("questions")
        .doc(promptDocData.questionId)
        .update({
          summary: response,
          responseCount: promptDocData.responseCount,
        });

    return response;
  } catch (error) {
    logger.error(`sendSummaryPrompt error: ${error}`);
    return;
  }
};

exports.sendFollowupPrompt = async (promptDocData, db) => {
  logger.debug(`sendFollowupPrompt start. ${JSON.stringify(promptDocData)}`);

  const chat = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.3,
    // maxRetries: 3,
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(promptDocData.systemMessage),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    llm: chat,
    prompt: chatPrompt,
  });

  logger.info("Calling chatgpt to generate followup.");

  try {
    const chatResponse = await chain.call({
      input: promptDocData.humanMessage,
    });

    const response = chatResponse.response;

    await db.collection("questions").add({
      parentId: promptDocData.questionId,
      question: response,
      session: promptDocData.session,
      seq: promptDocData.sequence,
      createdAt: Timestamp.now(),
      type: "followup",
      visible: true,
    });

    logger.info(`chatgpt response: ${JSON.stringify(chatResponse)}`);

    return response;
  } catch (error) {
    logger.error(`sendFollowupPrompt error: ${error}`);
    return;
  }
};
