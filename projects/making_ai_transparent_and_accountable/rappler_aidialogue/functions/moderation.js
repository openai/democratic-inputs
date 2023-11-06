const logger = require("firebase-functions/logger");
const {Timestamp} = require("firebase-admin/firestore");

// Sets visible the next main question to be shown to users
exports.showMainQuestion = async (sessionId, db) => {
  logger.debug("showMainQuestion start.");
  // Get the first hidden question
  const mainQuestions = await db.collection("questions")
      .where("session", "==", sessionId)
      .where("visible", "==", false)
      .where("type", "==", "main")
      .orderBy("seq")
      .limit(1)
      .get();

  if (mainQuestions.empty) {
    logger.error("ERROR: No questions in the bank!");
  } else {
    await db.collection("questions")
        .doc(mainQuestions.docs[0].id).update({
          visible: true,
          createdAt: Timestamp.now(),
        });
  }

  return;
};

// Returns the main question being discussed or
// the most recent follow up question to that main question.
exports.getCurrentQuestion = async (sessionId, db) => {
  logger.debug("getCurrentQuestion start.");
  const mainQuestions = await db.collection("questions")
      .where("session", "==", sessionId)
      .where("visible", "==", true)
      .where("type", "==", "main")
      .orderBy("seq", "desc")
      .limit(1)
      .get();

  if (mainQuestions.docs[0]) {
    const followupQuestions = await db.collection("questions")
        .where("parentId", "==", mainQuestions.docs[0].id)
        .where("type", "==", "followup")
        .orderBy("seq", "desc")
        .limit(1)
        .get();

    if (followupQuestions.docs[0]) {
      return followupQuestions.docs[0];
    } else {
      return mainQuestions.docs[0];
    }
  } else {
    logger.warn("getCurrentQuestion returning null.");
    return;
  }
};

// onlineUsers are those with status == online
// activeUsers are defined as those who have posted in the last X minutes
// TODO: Nothing changes a user's status unless manually logging off.
exports.getUserCounts = async (sessionId, db) => {
  // TODO: This should be configurable
  const millisecondsActive = 600000; // 60,000 = one minute
  const usersRef = db.collection("users");

  let onlineUsers = 0;
  let activeUsers = 0;

  // Let's user Timestamp.now() to make sure we are consistent
  // with how other dates were set.
  const minimumDate = Timestamp.fromDate(
      new Date(Timestamp.now().toDate() - millisecondsActive));

  logger.log(minimumDate);
  await usersRef
      .where("sessions", "array-contains", sessionId)
      .where("status", "==", "online")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          onlineUsers = onlineUsers + 1;
          const user = documentSnapshot.data();
          if (user.lastactive >= minimumDate) {
            activeUsers = activeUsers + 1;
          }
        });
      });

  return {online: onlineUsers, active: activeUsers};
};
