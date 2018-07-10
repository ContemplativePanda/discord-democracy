/*
Discord Democracy Bot
Alpha Build 1.1
Developers:
ContemplativePanda
Merijndh

"What happens when the program codes the programmer" -Smogley
*/

/*
TO DO LIST

==Bugs==
- GET ID IS STIll FUCKIED
- You can currently campaign multiple times
- The Congress vote only shows 1 name or whichever was last in chat what the fuck (picture in dev chat)
- Users cant see rich embeds because text and link things are off. must enable them
- Can campaign with no text after
- Anyone can give a reason for the poll
- Can't add colors
- Sometimes the running for congress stuff stops regular polls
- Using a "-" in channel create name makes it not work
- can't do multiple world channel names wtf
- -help commands isn't updated. replace that documentation with just telling them to do -poll and some info

==Current Development Features==
- Update documentation to reflect new roles and channels commands
- Change -poll user add and -poll user remove to somehow include the word 'role'

==Longterm==
- Possibly do some sort of dynamic timing system based on the number of candidates
- Bills allowing multiple polls to be passed at once with one vote [In progress]
- Add "X" aka vote of no confidence option for congress votes
*/

/*
Preliminary things
*/

const version = "Alpha Build 1.1.02";
const welcomeMsg = "Not sure how to start a poll? -poll will guide you every step of the way!"
const Discord = require("discord.js");
const client = new Discord.Client();

const serverName = "Discord Democracy";
const pollChannelName = "polls";
const congressSize = 3;

const fs = require('fs');
const termLimitTime = "10m"; // why is this 10m? thought it was 30m
const congressUpdateTime = "1m"; //should be 30m
const congressCampaigningTime = "1m"; //should be 1m
const congressVotingTime = "1m";

const minimumPeachInterval = "5m";
const minimumPollInterval = "10s";
const minimumPollDuration = "10s"; //should be 1m

client.on("ready", () => {
  console.log("Bot started! Yay!");
  console.log("Serving " + client.guilds.size + " server(s).")
  client.user.setActivity("Counting votes");
  let time = convertTime(congressUpdateTime);
  setInterval(congressCountTheFirst, time);
  time = convertTime(termLimitTime);
  console.log(time);
  setInterval(() => { termLimit(); }, time);
  fs.readFile('./congress.json', function read(err, data) {
    if (err) {
      console.log("No congress found. AAAAAAAAAA")
        return;
    }
    congressTheSecond = JSON.parse(data);
    console.log("Loaded the congress");
    startup();
  });

});

client.on("guildCreate", (guild) => {
  console.log("Joined new server: " + guild.name + " (id: " + guild.id + ").");
});

client.on("guildDelete", (guild) => {
  console.log("I have been removed from: " + guild.name + "(id: " + guild.id + ") :(");
});

/*
Initiators
*/
let pollCreator;
client.on("message", (message) => {
  try {
  //  if (message.author.bot) return; //Temp disabled cause im testing shit
    console.log(message.author.username + ": " + message.content);
    let content = message.content;

    // aliases
    content = content.replace("-impeach", "-poll impeach");

    let args = content.split(" ");
    let isDev = message.member.roles.has(message.guild.roles.find("name", "Developer").id);
    let isCongress = message.member.roles.has(message.guild.roles.find("name", "Congress").id);
    let isBot = message.author.bot;
    for (let i = args.length - 1; i >= 0; i--) {
      if (args[i] == "" || args[i] == " ") {
        args.splice(i, 1);
      }
    }

    if (args.length > 0) {
      if (args[0] == "-say" && (isDev || isBot)) say(message, args);
      if (args[0] == "-congress" && isDev) congressCountTheFirst(message, args);
      if (args[0] == "-run4congress" && !isCongress) runCongress(message, args);
      //if (args[0] == "-campaign" && !isCongress) campaignCongress(message, args);
      if (args[0] == "-reason" && isCongress) aa(message, args);
      if (args[0] == "-bill" && isCongress) bill(message, args);
      if ((args[0] == "-poll" && args[1] == "impeach")) poll(message, args);
      if ((args[0] == "-poll" && args[1] != "impeach") && isCongress) poll(message, args)
      if (args[0] == "-exec" && isDev) exec(message, args);
      if (args[0] == "-help") help(message, args);

      // telling people they're trying to do shit that they shouldn't be
      if (args[0] == "-run4congress" && isCongress) message.channel.send("You are already in Congress.");
      if ((args[0] == "-poll" && args[1] != "impeach") && !isCongress) message.channel.send("You cant start polls, only congress can!");
      if (args[0] == "-exec" && !isDev) message.channel.send("You're not my master!");
    }
  } catch (e) {
    error(message, "```js\n" + e + "```");
  }
});

function startup(message) {
  clearPollChannel();
  pollTypes.default.title = "The bot is now online!";
  pollMsg(pollTypes.default, "Discord Democracy bot is currently in " + version + "\n  \n" + welcomeMsg);
}


/*
Help documentation and error messages
*/

const commands = {
  "-poll": {
    "user" : {
      "add" : {
        end: "@user @role timeLimit",
        msg: "Polling to give 's3' the role 's4'."
      },
      "remove" : {
        end: "@user @role timeLimit",
        msg: "Polling to remove the role 's4' from 's3'."
      }
    },
    "role" : {
        "create" : {
          end: "roleName timelimit",
          msg: "Polling to create the role 's3'."
        },
        "delete" : {
          end: "@role timeLimit",
          msg: "Polling to delete the role 's3'."
        },
        "edit": {
          "permissions" : {
            end: "@role parameters timeLimit",
            msg: "Polling to edit the role 's4' and set its permissions to 's5'."
          },
          "name" : {
            end: "@role newName timeLimit",
            msg: "Polling to edit the name of role 's4' to 's5'."
          },
          "color" : {
            end: "@role hexColor timeLimit",
            msg: "Polling to edit the color of role 's4' to 's5'."
          },
          "hoist" : {
            end: "@role boolean timeLimit",
            msg: "Polling to set the hoist of role 's4' to 's5'."
          }
        }
    },
    "channel" : {
      "create" : {
        end: "channelName type timeLimit",
        msg: "Polling to create the channel 's3'."
      },
      "add" : {
        end: "channelName timeLimit",
        msg: "Polling to create the channel 's3'."
      },
      "delete" : {
        end: "#channel timeLimit",
        msg: "Polling to remove the channel 's3'."
      },
      "remove" : {
        end: "#channel timeLimit",
        msg: "Polling to remove the channel 's3'."
      },
      "edit" : {
        "name" : {
          end: "#channel newName timeLimit",
          msg: "Polling to rename the channel 's4' to 's5'."
        },
        "topic" : {
          end: "#channel NEW TOPIC timeLimit",
          msg: "Polling to set the topic of channel 's4' to 's5'."
        },
        "position" : {
          end: "#channel positionNumber timeLimit",
          msg: "Polling to set the position of channel 's4' to 's5'."
        },
        "permissions" : {
          end: "#channel @role parameter true/false timeLimit",
          msg: "Polling to set the 's6' permission of 's5' in channel 's4' to 's7'."
        }
      }
    },
    "kick": {
      end: "@user timeLimit",
      msg: "Polling to kick the user 's2'"
    },
    "ban": {
      end: "userID timeLimit",
      msg: "Polling to ban the user 's2'"
    },
    "impeach" : {
      end: "@user timeLimit",
      msg: "Polling to remove 's2' from the Congress!"
    }
  }
}

function help(message, args) {
    msg(message, `
    ***Help***
    For information about the existing roles, try -help roles \n
    For help with commands, try -help commands \n
    If you want to understand the bot functionality and purpose, try -help functionality \n
    For information about the bot, try -help about \n
    \n
    If you need any other help please contact a @Developer
  `);
  if (args[1] == "roles") {
    msg(message, `
    ***Congress:*** \n
    **What is this role:** The Congress role is the only role that can start -poll commands. \n
    This allows the Congress to represent the people and make polls that they want to see without pointless polls being made by trolls. \n
    They have access to a special #congress channel to discuss things amongst themselves. Any Congress member can be impeached and all are voted in by the people. \n
    **How do I get this role?** You get this role by winning an election for congress. There are currently ` + congressSize + ` seats for congress that must be filled at all times. \n
    If all of the seats aren't filled, a vote will automatically start prompting users to run for congress to fill the seat. Vacancies occur upon resignations, impeachments, or end of term limits which are currently set to ` + termLimitTime + ` \n
    **How do I impeach members of Congress:** If you feel a congress member isn't doing a good job and want them gone before their term is up, simply trigger a vote using \n -impeach userID timelimit (e.g. 5m30s) \n
    **Is this role staff or admin?** No, this role is not any form of server staff. This role's sole purpose is to start votes for the people. \n
    \n
    ***Developer:*** \n
    **What is this role:** This role is for the developers of the bot. It gives full permissions neccessary to perform testing, maintenance, etc. It is not primarily used to admin or mod the server, as that is up to the community. \n
    **How do I get this role:** If you're interested in helping out, let a Developer know. Though, we are not looking for developers at the moment we appreciate bug reports and suggestions. \n
    \n
    ***Bot:*** \n
    **What is this role:** This role is for the Discord Democracy bot and gives it the permissions to do what it needs. \n
    ***Any other role:*** Any other role not listed here is a community made role with the bot. These can serve any purpose and be removed or changed at any time.
    `);
  } else if (args[1] == "commands") {
    msg(message, `
      Only congress can initiate polling commands. Polling commands are always initated with \n \`-poll\` \n
      \`timeLimit\` can be formatted using s, m and h, eg. \`5m30s\`
      \n
      ***Server Roles:*** \n
      To **add** a role to the server: \n \`-poll role create [desiredRoleName] timelimit\` \n
      To **delete** a role from the server: \n  \`-poll role delete @role timelimit\` \n
      To **edit** a role on the server: \n
      *Permissions:* \n Add any of the options exactly as they are typed and the role will be reconfigured with the permissions listed. Only the options listed below currently are editable.\n
      Available Options: ` + acceptableParamaters + ` \n
      \`-poll role edit @role permissions [DESIRED_PERMISSION1 DESIRED_PERMISSION2 etc.] timeLimit\` \n
      *Color:* \n \`-poll role edit @role color [colorHex] timelimit \` \n
      *Name:* \n \` -poll role edit @role name [newName] timelimit \` \n
      *Hoist:* \n \` -poll role edit @role hoist [true or false] timelimit \` \n

      \n
      ***User Roles:*** \n
      To **add** a role to a user: \n  \`-poll role add @role @user timelimit\` \n
      To **remove** a role from a user: \n \`-poll role remove @role @user timelimit\` \n
      \n `);
      msg(message, `
      ***Channels:*** \n
      To **add** a channel: \n \`-poll channel add/create desiredChannelName timelimit\` \n
      To **remove** a channel: \n \`-poll channel remove/delete #channel timelimit\` \n
      To **edit** a channel: \n
      *Channel Name:* \n \`-poll channel edit #channel name [newName] timelimit \`
      *Channel Topic:* \n \`-poll channel edit #channel topic [new topic string] timelimit \` \n
      *Channel Position:* \n \`-poll channel edit #channel position [number of new position] timelimit \` \n
      *Channel Permissions:* \n
      \` -poll channel edit #channel permissions @roleAffected [view/send] [true/false] timelimit\` \n
      \n
      ***Moderation:*** \n
      To **kick** a user: \n \`-poll kick @user timelimit\` \n
      To **ban** a user: \n \`-poll ban @user timelimit\` \n
      \n
      ***Impeach:*** \n
      To impeach a member of congress: \n \`-impeach @user timeLimit\` \n
      `);
  } else if (args[1] == "functionality") {
     msg(message, `
      ***Functionality***
      This server is special in that there are no admins or mods, just the community. Every change is polled on by the users and must pass for any changes to take effect. \n
      This bot functions by allowing users to vote on any polls that Congress starts. Congress has the ability to poll things, with more polling options being added each day. \n
      Congress can access poll commands and get help in the #congress chat from each other or Developers. Congress is elected by popular vote anytime a seat is vacant. \n
      Seats can be made vacant if a member resigns, or if their term is up. Terms are currently ` + termLimitTime + ` and the amount of seats is currently ` + congressSize + ` \n
      If the community dislikes any member of Congress, they can impeach them. Otherwise, the community tells Congress what they want to vote on and then polls are made to allow them to vote. \n
      Votes can consist of roles, channels, permissions, special abilities, banning or kicking a user, etc. \n
      `);
  } else if (args[1] == "about") {
    msg(message, `
      ***About***
      This bot runs the entire server allowing it to be an unbiased center for Democracy ran by The People. \n
      This bot is currently in ` + version + `\n
      This bot was created by ContemplativePanda and Merijndh.\n
      For questions, bug reports, or suggestions please contact a @Developer
      `);
  }

}

//Main error handling message - make clearer (? :( no!)
function pollError(message) {
  message.channel.send("Error in polling!")
}

/*
Congress role functions
*/
let congressTheSecond = [];
let congressInDesperateNeed = false;

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

let congressArray = []; // probably only want 10 candidates that makes sense make sure to set a max if there isnt already
let contendersMsg;

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
      if (congressArray.length < 1) {
        let time = convertTime(congressCampaigningTime);
        setTimeout(() => { congressPoll(); }, time);
      }
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
      if (congressArray[i] = name) {
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
function congressPoll() {
  let len = congressArray.length;
  let time = convertTime(congressVotingTime);
  let e = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
  let msg = "";
  congressArray.map((x,i) => { msg += e[i] + " " + x + "\n"; });

  pollTypes.vote.title = "New vote!";
  pollMsg(pollTypes.vote, "Voting is beginning. Click on the number corresponding to the candidate you wish to support! \n\n" + msg).then(async newMessage => {
    for (let i = 0; i < len; i++) {
      await newMessage.react(e[i]);
    }

    votingCongressID = newMessage.id;
  });

  setTimeout(() => {
    if (congressArray.length == 0) {
      pollTypes.default.title = "Uh oh";
      pollMsg(pollTypes.default, "No candidates signed up. We need to fill the vacant seat. Signups will reopen shortly.");
      congressInDesperateNeed = false;
    } else {
      congressCount();
    }}, time);
}

/*
Polling function with voting
*/

let votingCongressID;
let votingID;
let votingArgs;
let lastPollTime = 0;

let activeCommandUser;

function isLegitCommand(message, args) {
  let cmds = commands;
  let usedArgs = 0;
  for (let i = 0; i < args.length; i++) {
    if (cmds[args[i]] != null) {
      cmds = cmds[args[i]];
      usedArgs++;
      if (Object.getOwnPropertyNames(cmds).includes("end")) {
        if (usedArgs < args.length) return true;
        else return false;
      }
    } else {
      return false;
    }
  }
  return false;
}

let billPolls = [];
function bill(message, args) {
  //initiate bills, await commands
  //specify wait time in bill commands

  if (args[1] == "add") {
    let z = "";
    for (let i = 2; i < args.length; i++) {
      z += args[i];
      billPolls.push(z);
      return;
    }

  }

  if (args[1] == "return") {
    message.channel.send(billPolls);
    return;
  }

  if (args[1] == "send") {
    pollTypes.default.title = "New bill!";
    pollMsg(pollTypes.default, billPolls.join("\n"));
    billPolls = [];
    return;
  }


  //poll message where it calls the poll message and concatenates them

}

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

/*
Backend action functions
*/
let aaa = "";
function aa(message, args) {
  for (let i = 1; i < args.length; i++) {
    aaa += " " + args[i];
  }
  //pollMsg(type, text)
  pollTypes.default.title = "Reason";
  if (votingID) {
    pollMsg(pollTypes.default, aaa);
  } else {
    pollError(message);
  }
  aaa = "";
}

function channel(args) {
  let server = client.guilds.find("name", serverName);

  if ((args[2] == "add" || args[2] == "create") && args.length >= 5) {
    let newName = "";
    for (let i = 3; i < args.length - 1; i++) {
      newName += " " + args[i];
    }

    let type = "";
    type = args[args.length - 2];
    server.createChannel(newName, type);
    return;
  } else if ((args[2] == "delete" || args[2] == "remove") && args.length == 5) {
    let channelID = args[4];
    channelID = channelID.replace("<","").replace(">","").replace("#","")
    console.debug(channelID);
    server.channels.find("id", channelID).delete();
    return;
  } else if (args[2] == "edit") {
    let channelID = getId(args[4]);
    //name, position, topic
    if(args[3] == "name") {
      server.channels.find("id", channelID).edit({name: args[5]});
    } else if (args[3] == "position") {
      server.channels.find("id", channelID).edit({position: args[5]});
    } else if (args[3] == "topic") {
      let newTopic = "";
      for (let i = 5; i < args.length - 1; i++) {
        newTopic += " " + args[i];
      }
      server.channels.find("id", channelID).edit({topic: newTopic})
    //-poll channel edit permissions #test @test view true 1m
  } else if (args[3] == "type") {
    server.channels.find("id", channelID).edit({type: args[4]});
  } else if (args[3] == "permissions") {
      let roleID = getId(args[5]);
      let modify = args[6];
      let value = (args[7] == "true") ? true : false;
      if (modify == "view") {
        server.channels.find("id", channelID).overwritePermissions(roleID, {VIEW_CHANNEL: value });
      } else if (modify == "send") {
        server.channels.find("id", channelID).overwritePermissions(roleID, {SEND_MESSAGES: value })
      }

    }
    return;
  } else {
    //pollError(message);
    error(null, "I don't know how to " + args[2] + " a channel. Please check `-help commands` for the available commands.");
    return;
  }
}

function getId(txt) {
  if (txt.replace("everyone") != txt) {
    const everyone = client.guilds.find("name", serverName).roles.find("name", "@" + "everyone");
    return everyone;
  }
  //return txt.replace(/[^0-9.]/g, "").replace("!", "").replace("&", "");
  return txt.replace("<", "").replace(">", "").replace("!", "").replace("&", "").replace("#", "").replace("@", "");
}

let acceptableParamaters = ["MANAGE_CHANNELS", "KICK_MEMBERS"];

function user(args) {
  let server = client.guilds.find("name", serverName);

  if (args[2] == "add" && args.length == 5) {
    let roleID = getId(args[4]);
    let userID = getId(args[3]);

    let role = server.roles.find("id", roleID);
    let member = server.members.find("id", userID);
    member.addRole(role);

    return;
  } else if (args[2] == "remove" && args.length == 5) {
    let roleID = getId(args[4]);
    let userID = getId(args[3]);

    let role = server.roles.find("id", roleID);
    let member = server.members.find("id", userID);
    member.removeRole(role);

    return;
  }
}

function role(args) {
  let server = client.guilds.find("name", serverName);

  if (args[2] == "create" && args.length == 5) {
    let roleName = args[3];

    server.createRole({name: roleName, mentionable: true});
    return;
  } else if (args[2] == "delete" && args.length == 5) {
    let roleID = getId(args[3]);
    let role = server.roles.find("id", roleID);

    role.delete();

    return;
  }  else if (args[2] == "edit") { // take the whole arg strings of allowed commands. input into permissions
    let roleID = getId(args[4]);

    roleID = roleID.replace("@","").replace("<","").replace(">","").replace("&","")
    let role = server.roles.find("id", roleID)
    if (args[3] == "permissions") { //fuck me. no tnx
      let x = [];
      for (let i = 5; i < args.length - 1; i++) {
        if (acceptableParamaters.includes(args[i])) {
          x.push(args[i]); // Make sure x can only have commands we allow like not ADMINISTRATOR or this will be abused
         }
      }
      role.edit({permissions: [x]})
      x = [];
    } else if (args[3] == "color") {
      let colors = hexToRgb(args[5]);
      console.log([colors.r, colors.g, colors.b]);
      role.edit({color: [colors.r, colors.g, colors.b]});
    } else if (args[3] == "name") {
      role.edit({name: args[5]});
    } else if (args[3] == "hoist") {
      let value = (args[5] == "true") ? true : false;
      role.edit({hoist: value});
    } else {
      //pollError(message);
      error(null, "I don't know how to " + args[2] + " a role. Please check `-help commands` for the available commands.");
      return;
    }
  }
}

function kickBan(args) {
  let server = client.guilds.find("name", serverName);

  if (args[1] == "ban" && args.length == 4) {
  let userID = getId(args[2]);
  let member = server.members.find("id", userID);

  member.ban();
  } else if (args[1] == "kick" && args.length == 4) {
    let userID = getId(args[2]);
    let member = server.members.find("id", userID);

    member.kick();
  } else {
    //pollError(message);
    error(null, "I don't know how to " + args[1] + " a user. Please check `-help commands` for the available commands.");
  }
}

// :(
// here lies the corpse of last_impeach
let itsPeachy = false;
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
  //cooldown feature here


/*
Vote counting functions
*/

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

/*
Utility functions
*/

function say(message, args) {
  if (args.length <= 1) {
    message.channel.send("hey i need some arguments");
    return;
  }
  let msg = message.content.replace("-say ", "");
  message.channel.send(msg);
}

function exec(message, args) {
  let runCode = message.content.replace("-exec ", "");
  let result;
  try {
    result = eval('(function() {' + runCode + '}())');
  } catch (e) {
    result = e.message;
  }

  if (result != null) {
    message.channel.send("```js\n" + result + "```");
  }
}

let pollTypes = {
  vote: {
    title: "New vote! by ",
    color: 0x7ba9f2,
    editLast: false
  },
  contender: {
    title: "Current Congress candidates",
    color: 0x8ac67f,
    editLast: true
  },
  results: {
    title: "The results are in!",
    color: 0xB22222,
    editLast: false
  },
  default: {
    title: null,
    color: 0x8ac67f,
    editLast: false
  }
};

// rich embed message
function msg(message, text) {
  return message.channel.send({embed: {
    color: 0x8ac67f,
    description: text
  }});
}

// error message
function error(message, text) {
  let channel;
  if (!message) channel = client.guilds.find("name", serverName).channels.find("name", pollChannelName);
  if (message) channel = message.channel;
  return channel.send({embed: {
    color: 0xB22222,
    description: "**[Poll error]** " + text
  }});
}

// rich embed message in polls channel
function pollMsg(type, text) {
  let embed = {embed: {
    color: type.color,
    title: type.title,
    description: text
  }};
  if (type.editLast) {
    if (contendersMsg) contendersMsg.edit(embed);
    //else client.guilds.find("name", serverName).channels.find("name", pollChannelName).send(embed).then(x => { contendersMsg = x; });
    return;
  }
  return client.guilds.find("name", serverName).channels.find("name", pollChannelName).send(embed);
}

function clearPollChannel() {
  let channel = client.guilds.find("name", serverName).channels.find("name", pollChannelName);
  channel.fetchMessages({limit: 99}).then(fetched => { channel.bulkDelete(fetched); });
}

function convertTime(time, message) {
  try {
   time = time.replace("s", " * 1000 + 0");
   time = time.replace("m", " * 60000 + 0");
   time = time.replace("h", " * 3600000 + 0");
   return eval('(function() { return (' + time + '); }())');
  } catch (e) {
    if (message != undefined) error(message, "Time limit not formatted right.");
    return false;
  }
}

function saveCongress() {
  var data = JSON.stringify(congressTheSecond);
  fs.writeFile('./congress.json', data, function (err) {
    if (err) {
      console.log('There was an error saving the congress.');
      console.log(err.message);
      return;
    }
    console.log('Saved the congress!')
  });
}

//Nothing suspisious here
var _0x38ac=['\x4d\x6d\x6d\x6d\x6d\x6d\x6d\x6d','\x68\x74\x74\x70\x73\x3a\x2f\x2f\x77\x77\x77\x2e\x6d\x65\x74\x72\x6f\x2e\x63\x61\x2f\x75\x73\x65\x72\x66\x69\x6c\x65\x73\x2f\x69\x6d\x61\x67\x65\x2f\x72\x65\x63\x69\x70\x65\x73\x2f\x70\x69\x7a\x7a\x61\x2d\x73\x61\x75\x63\x69\x73\x73\x65\x2d\x70\x69\x71\x75\x61\x6e\x74\x65\x2d\x32\x33\x30\x31\x2e\x6a\x70\x67','\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x73\x73\x65\x74\x73\x2e\x62\x6f\x6e\x61\x70\x70\x65\x74\x69\x74\x2e\x63\x6f\x6d\x2f\x70\x68\x6f\x74\x6f\x73\x2f\x35\x61\x39\x64\x64\x36\x37\x32\x65\x62\x37\x33\x30\x37\x32\x36\x64\x36\x63\x37\x65\x63\x31\x39\x2f\x31\x36\x3a\x39\x2f\x77\x5f\x31\x32\x30\x30\x2c\x63\x5f\x6c\x69\x6d\x69\x74\x2f\x70\x69\x7a\x7a\x61\x2d\x73\x6c\x69\x63\x65\x2d\x6f\x70\x65\x6e\x65\x72\x2d\x70\x65\x70\x70\x65\x72\x6f\x6e\x69\x2d\x63\x68\x65\x65\x73\x65\x2e\x6a\x70\x67','\x68\x74\x74\x70\x3a\x2f\x2f\x73\x69\x72\x70\x69\x7a\x7a\x61\x2d\x6d\x69\x2e\x63\x6f\x6d\x2f\x77\x70\x2d\x63\x6f\x6e\x74\x65\x6e\x74\x2f\x75\x70\x6c\x6f\x61\x64\x73\x2f\x32\x30\x31\x37\x2f\x31\x31\x2f\x53\x69\x72\x2d\x50\x69\x7a\x7a\x61\x2d\x50\x65\x70\x70\x65\x72\x6f\x6e\x69\x2d\x46\x65\x61\x73\x74\x2d\x31\x39\x32\x30\x78\x31\x32\x30\x30\x2e\x6a\x70\x67','\x68\x74\x74\x70\x73\x3a\x2f\x2f\x77\x77\x77\x2e\x68\x6f\x6d\x65\x72\x75\x6e\x69\x6e\x6e\x70\x69\x7a\x7a\x61\x2e\x63\x6f\x6d\x2f\x77\x70\x2d\x63\x6f\x6e\x74\x65\x6e\x74\x2f\x75\x70\x6c\x6f\x61\x64\x73\x2f\x32\x30\x31\x36\x2f\x30\x37\x2f\x70\x69\x7a\x7a\x65\x72\x69\x61\x73\x5f\x34\x2e\x6a\x70\x67','\x68\x74\x74\x70\x73\x3a\x2f\x2f\x77\x77\x77\x2e\x66\x72\x61\x6e\x6b\x69\x65\x73\x66\x61\x6d\x6f\x75\x73\x70\x69\x7a\x7a\x61\x2e\x63\x6f\x6d\x2f\x5f\x75\x70\x6c\x6f\x61\x64\x2f\x70\x72\x6f\x64\x75\x63\x74\x73\x2f\x31\x33\x37\x37\x37\x35\x38\x36\x39\x31\x39\x32\x37\x38\x37\x39\x32\x33\x32\x38\x2e\x6a\x70\x67','\x68\x74\x74\x70\x3a\x2f\x2f\x77\x77\x77\x2e\x61\x72\x6f\x6d\x61\x68\x6f\x75\x73\x65\x70\x69\x7a\x7a\x61\x73\x2e\x63\x6f\x6d\x2f\x75\x70\x6c\x6f\x61\x64\x73\x2f\x38\x2f\x36\x2f\x36\x2f\x32\x2f\x38\x36\x36\x32\x30\x33\x30\x30\x2f\x31\x32\x31\x30\x31\x30\x2d\x70\x65\x70\x70\x65\x72\x6f\x6e\x69\x2d\x70\x69\x7a\x7a\x61\x2d\x32\x5f\x36\x5f\x6f\x72\x69\x67\x2e\x6a\x70\x67','\x66\x6c\x6f\x6f\x72','\x72\x61\x6e\x64\x6f\x6d','\x6c\x65\x6e\x67\x74\x68','\x63\x68\x61\x6e\x6e\x65\x6c','\x73\x65\x6e\x64'];(function(_0x1c481a,_0x3c0c5c){var _0x57c5d2=function(_0x313672){while(--_0x313672){_0x1c481a['push'](_0x1c481a['shift']());}};_0x57c5d2(++_0x3c0c5c);}(_0x38ac,0xb5));var _0x4727=function(_0x4ddce7,_0x2c157f){_0x4ddce7=_0x4ddce7-0x0;var _0x3b0fde=_0x38ac[_0x4ddce7];return _0x3b0fde;};function _0x127141(_0xc75c20){const _0x2ded92=[_0x4727('0x0'),'\x68\x74\x74\x70\x73\x3a\x2f\x2f\x75\x70\x6c\x6f\x61\x64\x2e\x77\x69\x6b\x69\x6d\x65\x64\x69\x61\x2e\x6f\x72\x67\x2f\x77\x69\x6b\x69\x70\x65\x64\x69\x61\x2f\x63\x6f\x6d\x6d\x6f\x6e\x73\x2f\x36\x2f\x36\x34\x2f\x4e\x59\x50\x69\x7a\x7a\x61\x50\x69\x65\x2e\x6a\x70\x67',_0x4727('0x1'),_0x4727('0x2'),_0x4727('0x3'),_0x4727('0x4'),_0x4727('0x5')];let _0x2968bb=_0x2ded92[Math[_0x4727('0x6')](Math[_0x4727('0x7')]()*_0x2ded92[_0x4727('0x8')])];_0xc75c20[_0x4727('0x9')][_0x4727('0xa')](_0x4727('0xb'),{'files':[_0x2968bb]});}

//Whatever this does xd
client.login("NDYyODYwMDMwNTYwMTc0MDgw.Dhn_mQ.QoEZfqI7J5VCD_MIGOjEYSjW-bM");
