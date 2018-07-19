/*
  [pollFunctions.js]
  All functions that make a poll happen.
  - poll(message, args)
  - countVotes()
*/

let votingID;
let votingArgs;
let lastPollTime = 0;
let pollCreator;
let activeCommandUser;

function poll(message, args) {
  pollCreator = message.author.username;
  if (Date.now() - lastPollTime < convertTime(minimumPollInterval)) {
    error(message, "Last poll was less then " + minimumPollInterval + " ago.")
    return;
  }

  if (votingID) {
    //pollError(message);
    error(message, "There is already a vote held right now!");
    return;
  }

  const nonos = [["461667381056634910", "Congress role"],
                 ["462449983350636554", "Congress channel"],
                 ["462449524493778965", "polls channel"],
                 ["461597485266370563", "Developer role"],
                 ["460562933538226176", "Bot role"]];

  for (let i = 0; i < nonos.length; i++) {
    if (message.content.replace(nonos[i][0], "") != message.content) {
      error(message, "You can't vote to affect the " + nonos[i][1] + "."); return;
    }
  }

  if (!isLegitCommand(message, args)) {
    //do our new thingy right here
    let cmds = commands;
    for (let i = 0; i < args.length; i++) {
      if (cmds[args[i]] != null) {
        cmds = cmds[args[i]];
        if (Object.getOwnPropertyNames(cmds).includes("end")) break;
      } else {
        pollError(message);
        return;
      }
    }
    if (Object.getOwnPropertyNames(cmds).includes("end")) {
      let txt = "Complete your command as follows: \n"
      txt += args.join(' ') + " " + cmds.end;
      msg(message, txt);
      return;
    } else {
      let availableCommands = Object.getOwnPropertyNames(cmds);
      let txt = "Type any of these commands next: \n"
      availableCommands.map(x => { txt += args.join(' ') + " " + x + "\n" });
      msg(message, txt.replace("-poll impeach", ""));
      return;
    }
  }

  if (args[1] == "impeach") {
    if (itsPeachy) {
      error(message, "You can't impeach that quickly!");
      return;
    } else if (!itsPeachy) {
      let congressRole = message.guild.roles.find("name", "Congress").id;
      let server = client.guilds.find("name", serverName);
      let userID = getId(args[2]);
      let member = server.members.find("id", userID);

      if (!member.roles.has(congressRole)) {
        error(message, "This user isn't in congress you idiot.");
        return;
      }
    }
  }

  let channel = "462449524493778965";

  let time = convertTime(args[args.length-1], message);
  if (time === false) return;
  if (time < convertTime(minimumPollDuration)) {
    error(message, "A poll must at least be " + minimumPollDuration + " long.")
    return;
  }

  let getcmd = commands;
  for (let i = 0; i < args.length; i++) {
    if (getcmd[args[i]] != null) {
      getcmd = getcmd[args[i]];
      if (Object.getOwnPropertyNames(getcmd).includes("end")) break;
    }
  }

  let text = getcmd.msg;
  text = text.replace("'s2'", args[2]);
  text = text.replace("'s3'", args[3]);
  text = text.replace("'s4'", args[4]);
  text = text.replace("'s5'", args[5]);
  text = text.replace("'s6'", args[6]);
  text = text.replace("'s7'", args[7]);

  msg(message, "Starting new poll! Check #polls to vote!");
  msg(message, "Add a reason for the poll with: -reason your reason for this poll")


  clearPollChannel();
  pollTypes.vote.title = "New poll! by " + pollCreator;
  pollMsg(pollTypes.vote, text).then(newMessage => {
    newMessage.react("👍").then(() => {
      newMessage.react("👎")
      .catch(console.error);
    })
    .catch(console.error);
    votingArgs = args;
    votingID = newMessage.id;

    setTimeout(() => { countVotes(); }, time);
  })
  .catch (console.error);
}

function countVotes() {
  if (!votingArgs || !votingID) {
    //pollError(message);
    error(null, "I don't know how to " + args[2] + " a channel. Please check `-help commands` for the available commands.");
    return;
  }

  let msg = client.guilds.find("name", serverName).channels.find("name", pollChannelName).messages.find("id", votingID);
  let no = msg.reactions.get("👎").count - 1;
  let yes = msg.reactions.get("👍").count - 1;
  let results = "There were " + yes + " yes votes and " + no + " no votes";

  if(yes > no) {
    pollMsg(pollTypes.results, results + "\nThe vote passes!")
    if (votingArgs[1] == "channel") channel(votingArgs);
    if (votingArgs[1] == "role") role(votingArgs);
    if (votingArgs[1] == "user") user(votingArgs);
    if (votingArgs[1] == "ban" || votingArgs[1] == "kick") kickBan(votingArgs);
    if (votingArgs[1] == "impeach") impeach(votingArgs);
  } else if (yes <= no) {
    pollMsg(pollTypes.results, results + "\nThe vote fails!")
  }

  votingID = null;
  votingArgs = null;
  return;
}
