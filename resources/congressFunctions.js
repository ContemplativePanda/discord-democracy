/*
  [congressFunctions.js]
  Functions for the congress voting, campaiging, impeaching and term limit thingy.
  - congressCountTheFirst()
  - impeach(args)
  - congressCount()
  - termLimit(message)
  - runCongress(message, args)
  - campaignCongress(message, args)
  - reason(message, args)
*/

let votingCongressID;
let congressTheSecond = [];
let congressInDesperateNeed = false;
let congressArray = [];
let contendersMsg;
let itsPeachy = false;

function congressCountTheFirst() {
  if (congressInDesperateNeed) return;
  let time = convertTime(congressCampaigningTime);
  let congress = client.guilds.find("name", serverName).roles.find("name", "Congress");
  let congressMembers = congress.members.array();
  let congressCountSize = congressMembers.length;

  if (congressCountSize < congressSize) {
    clearPollChannel();
    pollTypes.default.title = "Oh no!";
    pollMsg(pollTypes.default, "Congress doesn't have enough people! Begin campaigining, a vote will begin shortly. \nTo submit your name, say '-run4congress'");
    congressInDesperateNeed = true;

    let time = convertTime(congressCampaigningTime);
    setTimeout(() => { congressPoll(); }, time);
    client.guilds.find("name", serverName).channels.find("name", pollChannelName).send(" ឵឵").then(x => { contendersMsg = x; });
    //if (congressArray.length == 0) { congressCountTheFirst(); } else {
    // setTimeout(() => {
    //   if (congressArray.length == 0) {
    //     pollTypes.default.title = "Uh oh";
    //     pollMsg(pollTypes.default, "No candidates signed up. We need to fill the vacant seat. Signups will reopen shortly.");
    //     congressInDesperateNeed = false;
    //   } else {
    //     congressPoll();
    //   }}, time);
  }
}

function congressPoll() {
  let len = congressArray.length;
  let time = convertTime(congressVotingTime);
  let e = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
  let msg = "";
  congressArray.map((x,i) => { msg += e[i] + " " + x + "\n"; });

  if (len > 0) {
    pollTypes.vote.title = "New vote!";
    pollMsg(pollTypes.vote, "Voting is beginning. Click on the number corresponding to the candidate you wish to support! \n\n" + msg).then(async newMessage => {
      for (let i = 0; i < len; i++) {
        await newMessage.react(e[i]);
      }

      votingCongressID = newMessage.id;
    });
  }
  setTimeout(() => {
    if (congressArray.length == 0) {
      pollTypes.default.title = "Uh oh";
      pollMsg(pollTypes.default, "No candidates signed up. We need to fill the vacant seat. Signups will reopen shortly.");
      congressInDesperateNeed = false;
    } else {
      congressCount();
    }}, time);
}

function impeach(args) {
  let server = client.guilds.find("name", serverName);
  let roleID = "461667381056634910";
  let userID = getId(args[2]);

  let role = roleID
  let member = server.members.find("id", userID);

  // erase him from all our memories
  member.removeRole(role);
  for (let i = 0; i < congressTheSecond.length; i++) {
    if (congressTheSecond[i].id == member.id) {
      congressTheSecond.splice(i, 0);
      itsPeachy = true;
      break;
    }
  }
  setTimeout(() => {
    itsPeachy = false;
  }, convertTime(minimumPeachInterval));
  saveCongress();
}

function congressCount() {
  if (!votingCongressID) return;

  let e = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
  let msg = client.guilds.find("name", serverName).channels.find("name", pollChannelName).messages.find("id", votingCongressID);

  let results = [];
  for (let i = 0; i < congressArray.length; i++ ) {
    results.push({nickname: congressArray[i], votes: msg.reactions.get(e[i]).count - 1});
  }

  contendersMsg = null;
  let congressVoteTallyCountSum = 0;
  for (let i = 0; i < results.length; i++) {
    congressVoteTallyCountSum += results[i].votes; // sum(e[i])
  }

  results = results.sort((a,b) => {
    if (a.votes > b.votes) return -1;
    if (b.votes > a.votes) return 1;
    return 0;
  });

  let maxVotes = results[0].votes;
  let newNewArray = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].votes == maxVotes) {
      newNewArray.push(results[i]);
    }
  }

  if (congressVoteTallyCountSum < 3) {
    pollMsg(pollTypes.results, "Not enough people voted!");
    congressArray = [];
    congressInDesperateNeed = false;
    votingCongressID = null;
    return;
  }

  if (newNewArray.length == 1) {
    //No tie -- clear winner
    pollMsg(pollTypes.results, "The winner is " + results[0].nickname + " with " + results[0].votes + " votes \n" + results[0].nickname + " is now a member of congress")
    let roleID = "461667381056634910";
    let userID = results[0].nickname;
    let server = client.guilds.find("name", serverName);
    let role = server.roles.find("id", roleID);
    let member = server.members.find(x => x.user.username === userID);
    member.addRole(role);
    congressTheSecond.push({id: member.id, timestamp: Date.now()});
    saveCongress();

    congressArray = [];
    congressInDesperateNeed = false;
    votingCongressID = null;
  } else if (newNewArray.length > 1) {
    // tie
    congressArray = newNewArray.map(x => x.nickname);
    pollMsg(pollTypes.results, "There was a tie! We will vote again to break the tie and determine a winner!");
    congressPoll();
  }
  return;
}

function termLimit(message) {
  if (congressTheSecond.length == 0) return;

  let lowestTimeStamp = Date.now() + 100;
  let lowestID = 0;
  for (let i = 0; i < congressTheSecond.length; i++) {
    if (congressTheSecond[i].timestamp < lowestTimeStamp) {
      lowestTimeStamp = congressTheSecond[i].timestamp;
      lowestID = congressTheSecond[i].id;
    }

  }

  let server = client.guilds.find("name", serverName);
  let roleID = "461667381056634910";

  let role = roleID;
  let member = server.members.find("id", lowestID);

  // erase him from all our memories
  member.removeRole(role);
  for (let i = 0; i < congressTheSecond.length; i++) {
    if (congressTheSecond[i].id == member.id) {
      congressTheSecond.splice(i, 1);
    }
  }
  saveCongress();

  pollTypes.default.title = "Term Limit";
  pollMsg(pollTypes.default, "The term limit for " + member.user.username + " is up. A spot will be opening in congress.");
}

function runCongress(message, args) {
  if (congressInDesperateNeed) {

    if (votingCongressID) {
      // too damn late
      //pollError(message);
      error(message, "Too late! Voting on the new Congress member has already started!");
      return;
    }

    let name = message.author.username;
    let duplicate = false;
    if (congressArray.length >= 10) {
      error(message, "Only 10 people can run for Congress!");
      return;
    }
    for(let i = 0; i < congressArray.length; i++) {
      if (congressArray[i] == name) {
        message.channel.send("Don't run twice!");
        duplicate = true;
        return;
      }
    }
    if (duplicate == false) {
      // if (congressArray.length < 1) {
      //   let time = convertTime(congressCampaigningTime);
      //   setTimeout(() => { congressPoll(); }, time);
      // }
      congressArray.push(name);
      msg(message, "You are now running for Congress!");
      msg(message, "Use -campaign to give yourself a platform!")
      pollMsg(pollTypes.contender, congressArray.join("\n"));
    //set some time limit to go to vote
    }
  } else if (!congressInDesperateNeed) {
    let rekt = [
      "Nope, we don't need any elected officials right now, nice try Putin",
      "Sorry Mr. Trump, 'separation of powers' refers to you not being able to serve on congress & the executive branch at the same time, not physically separating the USA from China. You are unable to join Congress at the moment.",
      "Hide your emails, Hillary is trying to get into congress when we don't even need anyone!",
      "Obummer, congress is full at the moment.",
    ]
    let len = rekt.length
    let x = Math.floor(Math.random() * len);
    message.channel.send(rekt[x]);

  }
}

function campaignCongress(message, args) {
  if (congressInDesperateNeed) {

    if (votingCongressID) {
      // too damn late
      //pollError(message);
      error(message, "Too late! Voting on the new Congress member has already started!");
      return;
    }
    let name = message.author.username;
    let ableToCampaign = false;
    let msg = ""
    for (let i = 1; i < args.length; i++) {
        msg += " " + args[i];
    }

    for (let i = 0; i < congressArray.length; i++) {
      if (congressArray[i] == name) {
        ableToCampaign = true;
      }
    }
    if (ableToCampaign) {
      pollTypes.default.title = name + "'s Campaign Platform";
      pollMsg(pollTypes.default, msg);
      ableToCampaign = false;
      return;
    }

    if (!ableToCampaign) {
      error(message, "You can't campaign - you aren't running for Congress!");
      return;
    }
  }
}

function reason(message, args) {
  let msg = "";
  for (let i = 1; i < args.length; i++) {
    msg += " " + args[i];
  }
  //pollMsg(type, text)
  pollTypes.default.title = "Reason";
  if (votingID) {
    pollMsg(pollTypes.default, aaa);
  } else {
    pollError(message);
  }
}
