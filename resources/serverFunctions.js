/*
  [serverFunctions.js]
  Functions that affect the discord server, called when a poll is succesfull.
  - channel(args)
  - user(args)
  - role(args)
  - kickBan(args)
*/

function channel(args) {
  let server = client.guilds.find("name", serverName);

  if ((args[2] == "add" || args[2] == "create") && args.length >= 5) {
    let newName = "";
    newName.replace("-", " ");
    for (let i = 3; i < args.length - 1; i++) {
      newName += " " + args[i];
    }

    let type = "";
    type = args[args.length - 2];
    server.createChannel(newName, type);
    return;
  } else if ((args[2] == "delete" || args[2] == "remove") && args.length == 5) {
    let channelID = args[3];
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

function user(args) {
  let server = client.guilds.find("name", serverName);

  if (args[2] == "add" && args.length == 6) {
    let roleID = getId(args[4]);
    let userID = getId(args[3]);

    let role = server.roles.find("id", roleID);
    let member = server.members.find("id", userID);
    member.addRole(role);

    return;
  } else if (args[2] == "remove" && args.length == 6) {
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
      let newRoleName = "";
      for (let i = 6; i < args.length - 1; i++) {
        newRoleName += args[i];
      }
      role.edit({name: newRoleName});
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
