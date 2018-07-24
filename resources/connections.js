/*
  [connection.js]
  All connections between the bot and discord: send and receiving messages
  - client.on("ready")()
  - client.on("message")(message)
  - say(message, args)
  - msg(message, text)
  - error(message, text)
  - pollMsg(type, text)
  - startup(message)
*/

const Discord = require("discord.js");
const client = new Discord.Client();

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
      if (args[0] == "-campaign" && !isCongress) campaignCongress(message, args);
      if (args[0] == "-reason" && isCongress) reason(message, args);
      if (args[0] == "-bill" && isCongress) bill(message, args);
      if ((args[0] == "-poll" && args[1] == "impeach")) impeach2(message, args);
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

function say(message, args) {
  if (args.length <= 1) {
    message.channel.send("hey i need some arguments");
    return;
  }
  let msg = message.content.replace("-say ", "");
  message.channel.send(msg);
}

function pollError(message) {
  message.channel.send("Error in polling!")
}

function msg(message, text) {
  return message.channel.send({embed: {
    color: 0x8ac67f,
    description: text
  }});
}

function error(message, text) {
  let channel;
  if (!message) channel = client.guilds.find("name", serverName).channels.find("name", pollChannelName);
  if (message) channel = message.channel;
  return channel.send({embed: {
    color: 0xB22222,
    description: "**[Poll error]** " + text
  }});
}

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

function startup(message) {
  clearPollChannel();
  pollTypes.default.title = "The bot is now online!";
  pollMsg(pollTypes.default, "Discord Democracy bot is currently in " + version + "\n  \n" + welcomeMsg);
}

//Whatever this does xd
client.login("NDYyODYwMDMwNTYwMTc0MDgw.Dhn_mQ.QoEZfqI7J5VCD_MIGOjEYSjW-bM");

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
}
