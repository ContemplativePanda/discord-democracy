/*
  [serverFunctions.js]
  Functions that affect the discord server, called when a poll is succesfull.
*/

// -poll channel create channelName type timeLimit
function createChannel(args) {
  const server = client.guilds.find("name", serverName);
  args.splice(0, 3);
  args.splice(args.length-1,1);
  let channelName = args.join(" ").replace("-", " ");
  let type = args[args.length - 2];
  server.createChannel(channelName, type);
}

// -poll channel delete #channel timeLimit
function deleteChannel(args) {
  const server = client.guilds.find("name", serverName);
  let channelID = getId(args[3]);
  server.channels.find("id", channelID).delete();
  return;
}

// -poll channel edit somethingsomething timeLimit
function editChannel(args) {
  let channelID = getId(args[4]);

  if(args[3] == "name") {
    server.channels.find("id", channelID).edit({name: args[5]});
  } if (args[3] == "position") {
    server.channels.find("id", channelID).edit({position: args[5]});
  } else if (args[3] == "topic") {
    args.splice(0, 5);
    args.splice(args.length-1,1);
    let newTopic = args.join(" ");
    server.channels.find("id", channelID).edit({topic: newTopic});
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
}

// -poll user roles add @user @role timeLimit
function userRolesAdd(args) {
  let server = client.guilds.find("name", serverName);
  let roleID = getId(args[5]);
  let userID = getId(args[4]);

  let role = server.roles.find("id", roleID);
  let member = server.members.find("id", userID);
  member.addRole(role);
}

// -poll user roles remove @user @role timeLimit
function userRolesRemove(args) {
  let server = client.guilds.find("name", serverName);
  let roleID = getId(args[5]);
  let userID = getId(args[4]);

  let role = server.roles.find("id", roleID);
  let member = server.members.find("id", userID);
  member.removeRole(role);
}

// -poll kick @user timeLimit
function kick(args) {
  let server = client.guilds.find("name", serverName);
  let userID = getId(args[2]);
  let member = server.members.find("id", userID);
  member.kick();
}

// -poll ban @user timeLimit
function ban(args) {
  let server = client.guilds.find("name", serverName);
  let userID = getId(args[2]);
  let member = server.members.find("id", userID);
  member.ban();
}

// -poll role create roleName timeLimit
function createRole(args) {
  let server = client.guilds.find("name", serverName);
  args.splice(0, 3);
  args.splice(args.length-1,1);
  let roleName = args.join("");
  server.createRole({name: roleName, mentionable: true});
}

// -poll role delete @role timeLimit
function deleteRole(args) {
  let server = client.guilds.find("name", serverName);
  let roleID = getId(args[3]);
  let role = server.roles.find("id", roleID);
  role.delete();
}

// -poll role edit @role somethingsomething timeLimit
function editRole(args) {
  let server = client.guilds.find("name", serverName);
  let roleID = getId(args[4]);
  let role = server.roles.find("id", roleID);

  if (args[3] == "permissions") {
    let x = [];
    for (let i = 5; i < args.length - 1; i++) {
      if (acceptableParamaters.includes(args[i])) x.push(args[i]);
    }
    role.edit({permissions: [x]})
  } else if (args[3] == "color") {
    let colors = hexToRgb(args[5]);
    //console.log([colors.r, colors.g, colors.b]);
    role.edit({color: [colors.r, colors.g, colors.b]});
  } else if (args[3] == "name") {
    args.splice(0, 6);
    args.splice(args.length-1,1);
    role.edit({name: args.join("")});
  } else if (args[3] == "hoist") {
    let value = (args[5] == "true") ? true : false;
    role.edit({hoist: value});
  }
}
