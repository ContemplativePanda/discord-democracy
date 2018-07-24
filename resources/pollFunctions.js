/*
  [pollFunctions.js]
  All functions that make a poll happen.
  - poll(message, args)
  - class Poll
*/
let currentPoll = null;
let lastPollTimestamp = 0;

function poll(message, args) {
  if (Date.now() - lastPollTimestamp < convertTime(minimumPollInterval)) {
    error(message, "Last poll was less then " + minimumPollInterval + " ago.")
    return;
  }

  if (currentPoll !== null) {
    error(message, "There is already a vote held right now!");
    return;
  }

  let commandData = validateCommand(message, args);
  if (!commandData) return;
  let endError = validateEnd(commandData, args);
  if (endError !== false) {
    msg(message, endError);
    return;
  }

  for (let i = 0; i < nonos.length; i++) {
    if (message.content.replace(nonos[i][0], "") != message.content) {
      error(message, "You can't vote to affect the " + nonos[i][1] + ".");
      return;
    }
  }

  let time = convertTime(args[args.length-1], message);
  if (time === false) return;
  if (time < convertTime(minimumPollDuration)) {
    error(message, "A poll must at least be " + minimumPollDuration + " long.")
    return;
  }

  currentPoll = new Poll(message, args, time, commandData);
}


class Poll {
  constructor(pollMessage, pollArgs, pollLength, commandData) {
    this.creator = pollMessage.author.username;
    this.originalMessage = pollMessage;
    this.args = pollArgs;
    this.startMsg = commandData.msg;
    this.function = commandData.function;
    this.length = pollLength;

    lastPollTimestamp = Date.now();

    this.start();
    setTimeout(() => { this.countVotes(); }, this.length);
  }

  start() {
    let text = this.startMsg;
    for (let i = 0; i < 10; i++) {
      text = text.replace("'s" + i + "'", this.args[i]);
    }

    msg(this.originalMessage, "Starting new poll! Check #polls to vote! \nAdd a reason for the poll with: -reason your reason for this poll");
    clearPollChannel();
    pollTypes.vote.title = "New poll! by " + this.creator;
    pollMsg(pollTypes.vote, text).then(newMessage => {
      newMessage.react("👍").then(() => { newMessage.react("👎"); });
      this.voteMessage = newMessage;
    })
  }

  countVotes() {
    currentPoll = null;

    if (this.voteMessage.id === undefined) {
      pollError(this.originalMessage);
    }

    let msg = client.guilds.find("name", serverName).channels.find("name", pollChannelName).messages.find("id", this.voteMessage.id);
    let no = msg.reactions.get("👎").count - 1;
    let yes = msg.reactions.get("👍").count - 1;

    let results = "There were " + yes + " yes votes and " + no + " no votes";
    if (yes > no) {
      pollMsg(pollTypes.results, results + "\nThe vote passes!");
      this.function(this.args);
      return;
    }

    pollMsg(pollTypes.results, results + "\nThe vote fails!");
  }
}
