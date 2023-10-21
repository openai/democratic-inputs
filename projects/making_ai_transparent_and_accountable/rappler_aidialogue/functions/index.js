const logger = require("firebase-functions/logger");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK
// - to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {
  getAuth,
} = require("firebase-admin/auth");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
// const {Timestamp} = require("firebase-admin/firestore");

// Dependencies for callable and scheduled functions.
const {onCall} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");

const FGDAIprompts = require("./prompts");
const chatGPT = require("./chatgpt");
const moderator = require("./moderation");

initializeApp();
// get firestore instance
const db = getFirestore();
// get auth instance
const auth = getAuth();

const AI_MODERATOR_NAME = "Rai";
const aierrors = [
  `Oops! ${AI_MODERATOR_NAME} got distracted by a mouse... 
  Let's give her a moment to compose herself.`,
  `${AI_MODERATOR_NAME} just went to the bathroom. 
  She'll be back soon.`,
  `Looks like ${AI_MODERATOR_NAME} dozed off. 
  Please stay tuned while we give her a nudge.`,
];

const AI_TIMEOUT_SECONDS = 540;


const aiSaid = async (session, message) => {
  await db.collection("aistatus").add({
    session: session,
    message: message,
    createdAt: Timestamp.now(),
  });
};

// - Listens for new messages added to /prompts/:promptId/prompt
//     and sends the prompt to a selected llm.
// - Waits for the response and saves to /prompts/:promptId/response
//
// ***Note: To run locally,
//  create a .secret.local file with your key in OPENAI_API_KEY
//
// ***Note: To test locally, use method signature below
// exports.talkToAI = onCall(
//     {
//       timeoutSeconds: 540,
//       memory: "1GiB",
//       secrets: ["OPENAI_API_KEY"],
//     },
//     async (request) => {
//       const data = request.data;
//       const promptDoc = await db.collection("prompts")
//           .doc(data.promptId)
//           .get();
//       const prompt = promptDoc.data();
exports.talkToAI = onDocumentCreated(
    {
      document: "/prompts/{promptId}",
      timeoutSeconds: AI_TIMEOUT_SECONDS,
      memory: "1GiB",
      secrets: ["OPENAI_API_KEY"],
    },
    async (event) => {
      // Grab the current value of what was written to Firestore.
      const prompt = event.data.data();

      logger.debug("talkToAI start.");

      let response = "";

      // Check createdAt. If it has been more then 10 minutes, do not process
      const secondsElapsed = Timestamp.now() - prompt.createdAt;
      if (secondsElapsed > AI_TIMEOUT_SECONDS) {
        response = "ERROR: Cancelled by moderator";
        return event.data.ref.set({response}, {merge: true});
      } else {
        switch (prompt.type) {
          case "followup": {
            response = await chatGPT.sendFollowupPrompt(prompt, db);
            break;
          }
          case "summary": {
            response = await chatGPT.sendSummaryPrompt(prompt, db);
            break;
          }
          case "policy": {
            response = await chatGPT.sendPolicyPrompt(prompt, db);
            break;
          }
        }
        if (!response) {
          await aiSaid(prompt.session,
              aierrors[Math.floor(Math.random() * aierrors.length)]);
        }
        return event.data.ref.set({response}, {merge: true});
      }
    },
);

// - must be provided a questionId of a MAIN question
// - will check for followup questions if any
// - prompt AI to generate follow up questions based on current discussion
// - write questions into the questions collection in firestore
// - data.questionId: string, id of a question doc with type "main"
exports.generateQuestion = onCall(// { enforceAppCheck: true, },
    async (request) => {
      logger.debug(`generateQuestion start.`);
      const data = request.data;

      if (data.questionId) {
        // Question ID passed is always a top-level question.
        // Get possible follow up questions being discussed already.
        const questionDoc = await db.collection("questions")
            .doc(data.questionId).get();

        aiSaid(questionDoc.data().session, `Thank you for your insights! 
            ${AI_MODERATOR_NAME} may send some follow-up questions 
            based on points raised by the group. Please stay tuned.`);

        await FGDAIprompts.getFollowup(questionDoc, db);
      }

      return;
    },
);

// - must be provided the question uuid
// - query all responses for given question
// - prompt AI to generate a summary of the responses
// - write the summary to the summary attribute
//     of question doc in firestore
exports.summarizeResponses = onCall(// { enforceAppCheck: true, },
    async (request) => {
      logger.debug("summarizeResponses start.");

      const data = request.data;

      if (data.questionId) {
        const questionDoc = await db
            .collection("questions")
            .doc(data.questionId)
            .get();

        aiSaid(questionDoc.data().session, `Awesome responses! 
          ${AI_MODERATOR_NAME} is summarizing your inputs. 
          This may take a few minutes. Please hold tight!`);

        // Get the minRespondersForSummary value for this session
        const sessionDoc = await db.collection("sessions")
            .doc(questionDoc.data().session)
            .get();

        let minRespondersForSummary = 10;
        if (sessionDoc.get("minRespondersForSummary")) {
          minRespondersForSummary = sessionDoc.data().minRespondersForSummary;
        }

        const followupQuestions = await db.collection("questions")
            .where("parentId", "==", questionDoc.id)
            .where("type", "==", "followup")
            .orderBy("seq", "desc")
            .get();

        for (const followup of followupQuestions.docs) {
          await FGDAIprompts.getSummary(followup, db, minRespondersForSummary);
        }

        await FGDAIprompts.getSummary(questionDoc, db, minRespondersForSummary);
      }
      return;
    },
);

// - does not need any parameter
// - creates the prompt for generating polices based on all responses
//     to all questions (main and followup)
exports.generatePolicies = onCall(// { enforceAppCheck: true, },
    async (request) => {
      logger.debug("generatePolicies start.");

      const data = request.data;

      if (data.session) {
        // Check if all questions have summaries.
        // This ensures there are responses.
        let proceed = true;
        const mainQuestions = await db.collection("questions")
            .where("session", "==", data.session.id)
            .where("type", "==", "main")
            .get();

        for (const question of mainQuestions.docs) {
          if (question.get("summary") === undefined) {
            proceed = false;
            break;
          }
        }

        if (proceed) {
          const followupQuestions = await db.collection("questions")
              .where("session", "==", data.session.id)
              .where("type", "==", "followup")
              .get();

          for (const question of followupQuestions.docs) {
            if (question.get("summary") === undefined) {
              proceed = false;
              break;
            }
          }
        }

        if (proceed) {
          aiSaid(data.session.id, `This might be a good time to get some 
            coffee or do some stretches? ${AI_MODERATOR_NAME} is thinking 
            of policies based on your insights and  suggestions. We'd 
            love to get your reactions to what she comes up with. 
            This may take a minute or so...`);

          await FGDAIprompts.getPolicyFromSummaries(data.session.id, db);
        }
      }
      return;
    },
);

exports.registerSessionUser = onCall(async (request) => {
  let response = {};
  const data = request.data;
  // console.log("registersessionUser", data);
  const {session, code, initials, gender, birthDate} = data;
  let {email=""} = data;
  // check if code matches the code for the session
  const sessionDoc = await db.collection("sessions").doc(session).get();
  const sessionData = sessionDoc.data();
  // console.log("session data", sessionData);
  if (sessionData.code !== code) {
    // throw new Error("Invalid code");
    response = {
      success: false,
      field: "code",
      message: "The code you entered is invalid for this session",
    };
  } else {
    try {
    // look for user with given initials, gender and birthDate
      let userDoc;
      if (email !== "") {
        userDoc = await db
            .collection("users")
            .where("initials", "==", initials)
            .where("gender", "==", gender)
            .where("birthDate", "==", birthDate)
            .where("email", "==", email)
            .limit(1)
            .get();
      } else {
        userDoc = await db
            .collection("users")
            .where("initials", "==", initials)
            .where("gender", "==", gender)
            .where("birthDate", "==", birthDate)
            .limit(1)
            .get();
      }

      const success = true;
      let existing = true;
      let uid;

      if (userDoc.docs[0]) {
      // user exists
        uid = userDoc.docs[0].id;
      } else {
      // user does not exist
      // create the user with firebase auth
        const rndm = Math.floor(Math.random() * 1000000);
        if (email === "") {
          email = `${initials}-${rndm}@fgdai.net`;
        }
        const user = await auth.createUser({
          email,
          password: `passFgdai-${rndm}`,
        });
        // create user record in firestore
        db.doc(`/users/${user.uid}`).set({
          initials,
          birthDate,
          gender,
          email,
          sessions: [session],
          uid: user.uid,
          status: "online",
        });
        existing = false;
        uid = user.uid;
      }
      // generate a custom token
      const token = await auth.createCustomToken(uid);

      // build the response
      response = {
        success,
        existing,
        uid,
        token,
      };
    } catch (err) {
      // build the error response
      response = {
        success: false,
        field: "email",
        message: err.message,
      };
    }
  }

  return response;
});

// This contains the rules for when one of the other functions
// are to be called (e.g. when to get follow up questions).
// It monitors a queue for ongoing "jobs" such as generating
// a follow up question.
exports.moderateChat = onSchedule("* * * * *", async (event) => {
  logger.debug("moderateChat start.");

  // Get a list of sessions that are automated.
  const sessions = await db.collection("sessions")
      .where("automated", "==", true)
      .get();

  for (const session of sessions.docs) {
    logger.debug(`Assessing ${session.id}`);
    let canModerate = true;

    // check if there is an existing job in progress. assuming we can only
    // have 5 concurrent prompts for each session (e.g. followup, summarize)
    const prompts = await db.collection("prompts")
        .where("session", "==", session.id)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

    for (const prompt of prompts.docs) {
      if (prompt.get("response") === undefined) {
        // check how long this has been running if it has exceeded the timeout
        // we can reset and we expect the algo to arrive at the same step.
        // If it hasn't exceeded the time limit, we can't moderate.
        const secondsElapsed = Timestamp.now() - prompt.data().createdAt;
        if (secondsElapsed < AI_TIMEOUT_SECONDS) {
          logger.debug("Giving current prompt time to complete or timeout.");
          canModerate = false;
          break;
        } else {
          // this prompt has taken too long and should be "cancelled"
          await db.collection("prompts")
              .doc(prompt.id)
              .update({
                response: "ERROR: Cancelled by moderator",
              });
          logger.debug(`Cancelled propmt. ${prompt.id}`);
        }
      }
    }

    if (canModerate) {
      logger.debug(`Moderating ${session.data().title}`);

      // Get the current state of this fgd session
      const currentQuestion = await moderator
          .getCurrentQuestion(session.id, db);

      if (currentQuestion) {
        logger.debug(`Active question: ${currentQuestion.id}`);
        // Rules for Generating Follow Up Questions
        let allotedMinutes = 3; // three minutes per question
        let allotedFollowups = 3; // up to three follow ups per question
        let minRespondersForSummary = 10;

        if (session.get("minutesPerQuestion")) {
          allotedMinutes = session.data().minutesPerQuestion;
        }

        if (session.get("followupsPerQuestion")) {
          allotedFollowups = session.data().followupsPerQuestion;
        }

        if (session.get("minRespondersForSummary")) {
          minRespondersForSummary = session.data().minRespondersForSummary;
        }

        // Get the time of the first response to this question
        const responses = await db.collection("responses")
            .where("questionId", "==", currentQuestion.id)
            .orderBy("createdAt")
            .limit(1)
            .get();

        if (responses.docs[0]) {
          const secondsElapsed = Timestamp.now() -
              responses.docs[0].data().createdAt;

          logger.debug(`It has been ${secondsElapsed} 
since the first response`);
          if (secondsElapsed >= allotedMinutes * 60) {
            // Ok, it's been 3 minutes now.
            // Check if current question is already a follow up
            if (currentQuestion.data().type == "followup") {
              if (currentQuestion.data().seq < allotedFollowups) {
                logger.debug(`Getting followup #
${currentQuestion.data().seq + 1}`);
                const questionDoc = await db.collection("questions")
                    .doc(currentQuestion.data().parentId).get();

                aiSaid(questionDoc.data().session, `Thank you for your 
                    insights! ${AI_MODERATOR_NAME} may send some follow-up 
                    questions based on points raised by the group.
                    Please stay tuned.`);

                await FGDAIprompts.getFollowup(questionDoc, db);
              } else {
                logger.debug("Showing the next question.");
                // We've reached the limit for follow ups, make the next
                // main question visible.
                await moderator.showMainQuestion(session.id, db);
              }
            } else {
              logger.debug(`Getting followup #1`);
              // This is a main question. Request for a follow up.
              aiSaid(currentQuestion.data().session, `Thank you for your 
                    insights! ${AI_MODERATOR_NAME} may send some follow-up 
                    questions based on points raised by the group.
                    Please stay tuned.`);

              await FGDAIprompts.getFollowup(currentQuestion, db);
            }

            // Loop through all visible questions for this session
            // and update those with existing summaries.
            const questions = await db.collection("questions")
                .where("session", "==", session.id)
                .where("visible", "==", true)
                .get();

            let hasOneSummary = false;
            let summariesComplete = true;
            let noPoliciesYet = true;
            for (const question of questions.docs) {
              // Generate summary only for main and followup types
              if (question.data().type == "main" ||
                  question.data().type == "followup") {
                if (question.get("summary") == undefined) {
                  summariesComplete = false;
                } else {
                  hasOneSummary = true;
                }

                await FGDAIprompts.getSummary(question, db,
                    minRespondersForSummary);
              }

              if (noPoliciesYet && question.data().type == "policycheck") {
                noPoliciesYet = false;
              }
            }

            if (summariesComplete && hasOneSummary && noPoliciesYet) {
              await FGDAIprompts.getPolicyFromSummaries(session.id, db);
            }
          } // else we do nothing, giving more users time to respond
        } // else we do nothing, we're still waiting for a response
      } else {
        // No visible questions yet. Determine if we can start based on the
        // number of online users.
        logger.log("No visible question. Checking for online users...");
        const counts = await moderator.getUserCounts(session.id, db);

        // TODO: num of online users required to start should be configurable
        // If we have X number of online users, make the first question visible
        if (counts.online >= 1) {
          await moderator.showMainQuestion(session.id, db);
        }
      }
    }
  }
});
