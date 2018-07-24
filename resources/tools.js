/*
  [tools.js]
  Usefull shit.
  - getId(txt)
  - hexToRgb(hex)
  - exec(message, args)
  - isLegitCommand(message, args)
  - clearPollChannel()
  - convertTime(time, message)
  - saveCongress()
  - help(message, args)
*/

function getId(txt) {
  if (txt.replace("everyone") != txt) {
    const everyone = client.guilds.find("name", serverName).roles.find("name", "@" + "everyone");
    return everyone;
  }
  return txt.replace(/[^0-9.]/g, "");
  //return txt.replace("<", "").replace(">", "").replace("!", "").replace("&", "").replace("#", "").replace("@", "");
}

function hexToRgb(hex) {
    var bytes = [], str;

    for(var i=0; i< hex.length-1; i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return String.fromCharCode.apply(String, bytes);
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

function validateCommand(message, args) {
  let cmds = commands;
  for (let i = 0; i < args.length; i++) {
    if (cmds[args[i]] != undefined) {
      cmds = cmds[args[i]];
      if (cmds.end != undefined) {
        if (i < args.length - 1)
          return {
            format: cmds.format,
            msg: cmds.msg,
            function: cmds.function,
            index: i+1
          };
        break;
      }
    } else {
      break;
    }
  }

  if (cmds.end != undefined) {
    msg(message, "Complete your command as follows: \n" + args.join(' ') + " " + cmds.end);
    return false;
  } else {
    let availableCommands = Object.getOwnPropertyNames(cmds);
    let txt = "Type any of these commands next: \n"
    availableCommands.map(x => { txt += args.join(' ') + " " + x + "\n" });
    msg(message, txt);
    return false;
  }
}

function validateEnd(commandEnd, args) {
  for (let i = commandEnd.index; i < args.length; i++) {
    if (commandEnd.format[i - commandEnd.index] == "user") {
      if (!checkUser(args[i])) {
        return "The provided user is invalid.";
      }
    }
    if (commandEnd.format[i - commandEnd.index] == "role") {
      if (!checkRole(args[i])) {
        return "The provided role is invalid.";
      }
    }
    if (commandEnd.format[i - commandEnd.index] == "channel") {
      if (!checkChannel(args[i])) {
        return "The provided channel is invalid.";
      }
    }
  }
  return false;
}

function checkUser(txt) {
  const id = getId(txt);
  if (!client.guilds.find("name", serverName).members.find("id", id)) return false;
  return true;
}

function checkRole(txt) {
  const id = getId(txt);
  if (!client.guilds.find("name", serverName).roles.find("id", id)) return false;
  return true;
}

function checkChannel(txt) {
  const id = getId(txt);
  if (!client.guilds.find("name", serverName).channels.find("id", id)) return false;
  return true;
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
