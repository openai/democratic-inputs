const logger = require("firebase-functions/logger");
const {Timestamp} = require("firebase-admin/firestore");
const AI_MODERATOR_NAME = "Rai";
const topic = "How should AI be governed? ";

// - must be provided a valid question doc
// - returns a collection of strings containing
//     the responses to this question.
const _collectResponses = async (questionDoc, db) => {
  const responses = [];
  const query = db.collection("responses");
  await query
      .where("questionId", "==", questionDoc.id)
      .orderBy("createdAt")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          const chatMessage = data.user.name + ": \"" + data.response + "\"";
          responses.push(chatMessage);
        });
      });
  return responses;
};

// - must be provided a valid question doc
// - queries all the responses based on the question
// - rebuilds the discussion that is to be sent to gpt
// - example:
//     AI_MODERATOR_NAME: "What do you think of this?"
//     Foo: "Well, I believe..."
//     Bar: "But maybe..."
const _transcribe = async (questionDoc, db) => {
  let transcript = [];
  if (questionDoc.data().question.startsWith("Rai:")) {
    transcript.push(questionDoc.data().question);
  } else {
    transcript.push(`${AI_MODERATOR_NAME}: "${questionDoc.data().question}"`);
  }
  transcript = transcript.concat(await _collectResponses(questionDoc, db));

  const followupQuestions = await db.collection("questions")
      .where("parentId", "==", questionDoc.id)
      .where("type", "==", "followup")
      .orderBy("seq", "asc")
      .get();

  for (const followupDoc of followupQuestions.docs) {
    transcript.push(`${AI_MODERATOR_NAME}: "${followupDoc.data().question}"`);
    transcript = transcript.concat(await _collectResponses(followupDoc, db));
  }

  return transcript;
};

// - creates a prompt for getting a follow up question based on
//     the responses to the question passed.
// - responses to the questionDoc is used in generating the promt.
// - questionDoc: firebase doc from question collection,
//     expected to be of type "main"
exports.getFollowup = async (questionDoc, db) => {
  logger.debug(`getFollowup start. ${JSON.stringify(questionDoc)}`);

  const followupQuestions = await db.collection("questions")
      .where("parentId", "==", questionDoc.id) // only followups have parentId
      .count().get();

  const sequence = followupQuestions.data().count + 1;

  const systemMessage = `
    Act as ${AI_MODERATOR_NAME}, the moderator of a focus 
    group discussing ${topic}.`;

  // Get the latest transcript of the discussion to send in the prompt
  const responses = await _transcribe(questionDoc, db);
  const humanMessage = `
    Generate the most pressing follow up question based on the 
    responses which have a high level of agreement but are vague. 
    This is the transcript of the discussion: 
    ${responses} 
  `;

  db.collection("prompts").add({
    humanMessage: humanMessage,
    systemMessage: systemMessage,
    questionId: questionDoc.id,
    session: questionDoc.data().session,
    type: "followup",
    sequence: sequence,
    createdAt: Timestamp.now(),
  });
  return;
};

// - creates a prompt for summarizing the response to this question
// - previous summaries will only be updated by new prompts
exports.getSummary = async (questionDoc, db, minRepondersForSummary = 10) => {
  logger.debug(`getSummary start. ${JSON.stringify(questionDoc)}`);
  const responses = await _collectResponses(questionDoc, db);
  const totalResponses = responses.length;

  const usersWhoResponded = new Set();
  for (const response of responses) {
    // Split the name from the response and store in a set.
    usersWhoResponded.add(response.split(":").shift());
  }

  if (usersWhoResponded.size < minRepondersForSummary) return;

  if (questionDoc.data().summary) {
    // Update the existing summary if there are new responses...
    if (totalResponses > questionDoc.data().responseCount) {
      // Get the ratio of the new responses
      const newResponses = totalResponses - questionDoc.data().responseCount;
      const ratio = newResponses / questionDoc.data().responseCount;
      let maxChange = "5%";

      if (ratio >= 1.0) { // If new responses are more than current
        maxChange = "40%";
      } else if (ratio >= 0.5) { // If new responses more than are half
        maxChange = "30%";
      } else if (ratio >= 0.25) {
        maxChange = "20%";
      } else if (ratio >= 0.12) {
        maxChange = "10%";
      }

      responses.splice(0, questionDoc.data().responseCount);

      const humanMessage = `
Modify at most ${maxChange} of the summary to include these new responses: 
${responses} 
      `;

      const systemMessage = "";

      db.collection("prompts").add({
        humanMessage: humanMessage,
        systemMessage: systemMessage,
        questionId: questionDoc.id,
        session: questionDoc.data().session,
        responseCount: totalResponses,
        type: "summary",
        createdAt: Timestamp.now(),
      });
    }
  } else {
    const humanMessage = `
This question was asked to a focus group: 
${questionDoc.data().question} 

And these are the responses:
${responses}

Summarize the responses into 3 to 5 points, 
prioritizing points with a high level of agreement 
or are evenly split between agree/disagree. 

Make sure that each user's statement 
is at least briefly used in at least one of the summary points. 

Format it like inside an html body (no <html> and <head> tags). 
Format each summary point into the template below: 
<p> 
<b>Numbered Title in 1-10 words</b> 
<br>Details: (10-300 words) 
<br /> 
<br />Agreed: (number of users whose statements align with the summary point, 
do not enumerate the names) | Disagreed: (number of users whose statements 
contradict the summary point, do not enumerate the names)</p>`;

    const systemMessage = `
Act as ${AI_MODERATOR_NAME}, the moderator of a focus group discussing 
${topic}. 
`;

    db.collection("prompts").add({
      humanMessage: humanMessage,
      systemMessage: systemMessage,
      questionId: questionDoc.id,
      session: questionDoc.data().session,
      responseCount: responses.length,
      type: "summary",
      createdAt: Timestamp.now(),
    });
  }

  return;
};

// - creates a prompt for generating the policies based on
// - all the responses to the questions
// TODO: Needs optimization, check if chatgpt can accept file uploads
// or base policies on summaries only.
// - See https://js.langchain.com/docs/modules/chains/additional/analyze_document
exports.getPolicies = async (session, db) => {
  logger.debug(`getPolicies start.`);
  let transcript = [];

  const mainQuestions = await db.collection("questions")
      .where("type", "==", "main")
      .where("session", "==", session)
      .orderBy("seq", "asc")
      .get();

  for (const mainQuestion of mainQuestions.docs) {
    const transcriptSection = await _transcribe(mainQuestion, db);
    transcript = transcript.concat(transcriptSection);
  }

  const humanMessage = `
Generate a list of 5-8 specific, actionable policies for the creation 
and use of AI based on the transcript below. The policies should be grouped 
into at least three categories. Use third person POV. Format 
the list as a json object whose keys are the categories and values are 
arrays of strings containing the policies.

This is the transcript of the discussion: 
${transcript}.
  `;

  const systemMessage = `
Act as ${AI_MODERATOR_NAME}, the moderator of a focus group discussing 
${topic}. 
  `;

  db.collection("prompts").add({
    humanMessage: humanMessage,
    systemMessage: systemMessage,
    session: session,
    type: "policy",
    createdAt: Timestamp.now(),
  });

  return;
};
