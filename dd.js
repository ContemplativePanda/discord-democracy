let votingCongressID,contendersMsg,congressTheSecond=[],congressInDesperateNeed=!1,congressArray=[],itsPeachy=!1;function congressCountTheFirst(){if(congressInDesperateNeed)return;convertTime(congressCampaigningTime);if(client.guilds.find("name",serverName).roles.find("name","Congress").members.array().length<congressSize){clearPollChannel(),pollTypes.default.title="Oh no!",pollMsg(pollTypes.default,"Congress doesn't have enough people! Begin campaigining, a vote will begin shortly. \nTo submit your name, say '-run4congress'"),congressInDesperateNeed=!0;let e=convertTime(congressCampaigningTime);setTimeout(()=>{congressPoll()},e),client.guilds.find("name",serverName).channels.find("name",pollChannelName).send(" ឵឵").then(e=>{contendersMsg=e})}}function congressPoll(){let e=congressArray.length,n=convertTime(congressVotingTime),s=["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣","🔟"],o="";congressArray.map((e,n)=>{o+=s[n]+" "+e+"\n"}),e>0&&(pollTypes.vote.title="New vote!",pollMsg(pollTypes.vote,"Voting is beginning. Click on the number corresponding to the candidate you wish to support! \n\n"+o).then(async n=>{for(let o=0;o<e;o++)await n.react(s[o]);votingCongressID=n.id})),setTimeout(()=>{0==congressArray.length?(pollTypes.default.title="Uh oh",pollMsg(pollTypes.default,"No candidates signed up. We need to fill the vacant seat. Signups will reopen shortly."),congressInDesperateNeed=!1):congressCount()},n)}function impeach(e){let n=client.guilds.find("name",serverName),s=getId(e[2]),o=n.members.find("id",s);o.removeRole("461667381056634910");for(let e=0;e<congressTheSecond.length;e++)if(congressTheSecond[e].id==o.id){congressTheSecond.splice(e,0),itsPeachy=!0;break}setTimeout(()=>{itsPeachy=!1},convertTime(minimumPeachInterval)),saveCongress()}function congressCount(){if(!votingCongressID)return;let e=["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣","🔟"],n=client.guilds.find("name",serverName).channels.find("name",pollChannelName).messages.find("id",votingCongressID),s=[];for(let o=0;o<congressArray.length;o++)s.push({nickname:congressArray[o],votes:n.reactions.get(e[o]).count-1});contendersMsg=null;let o=0;for(let e=0;e<s.length;e++)o+=s[e].votes;let r=(s=s.sort((e,n)=>e.votes>n.votes?-1:n.votes>e.votes?1:0))[0].votes,t=[];for(let e=0;e<s.length;e++)s[e].votes==r&&t.push(s[e]);if(o<3)return pollMsg(pollTypes.results,"Not enough people voted!"),congressArray=[],congressInDesperateNeed=!1,void(votingCongressID=null);if(1==t.length){pollMsg(pollTypes.results,"The winner is "+s[0].nickname+" with "+s[0].votes+" votes \n"+s[0].nickname+" is now a member of congress");let e="461667381056634910",n=s[0].nickname,o=client.guilds.find("name",serverName),r=o.roles.find("id",e),t=o.members.find(e=>e.user.username===n);t.addRole(r),congressTheSecond.push({id:t.id,timestamp:Date.now()}),saveCongress(),congressArray=[],congressInDesperateNeed=!1,votingCongressID=null}else t.length>1&&(congressArray=t.map(e=>e.nickname),pollMsg(pollTypes.results,"There was a tie! We will vote again to break the tie and determine a winner!"),congressPoll())}function termLimit(e){if(0==congressTheSecond.length)return;let n=Date.now()+100,s=0;for(let e=0;e<congressTheSecond.length;e++)congressTheSecond[e].timestamp<n&&(n=congressTheSecond[e].timestamp,s=congressTheSecond[e].id);let o=client.guilds.find("name",serverName).members.find("id",s);o.removeRole("461667381056634910");for(let e=0;e<congressTheSecond.length;e++)congressTheSecond[e].id==o.id&&congressTheSecond.splice(e,1);saveCongress(),pollTypes.default.title="Term Limit",pollMsg(pollTypes.default,"The term limit for "+o.user.username+" is up. A spot will be opening in congress.")}function runCongress(e,n){if(congressInDesperateNeed){if(votingCongressID)return void error(e,"Too late! Voting on the new Congress member has already started!");let n=e.author.username,s=!1;if(congressArray.length>=10)return void error(e,"Only 10 people can run for Congress!");for(let o=0;o<congressArray.length;o++)if(congressArray[o]==n)return e.channel.send("Don't run twice!"),void(s=!0);0==s&&(congressArray.push(n),msg(e,"You are now running for Congress!"),msg(e,"Use -campaign to give yourself a platform!"),pollMsg(pollTypes.contender,congressArray.join("\n")))}else if(!congressInDesperateNeed){let n=["Nope, we don't need any elected officials right now, nice try Putin","Sorry Mr. Trump, 'separation of powers' refers to you not being able to serve on congress & the executive branch at the same time, not physically separating the USA from China. You are unable to join Congress at the moment.","Hide your emails, Hillary is trying to get into congress when we don't even need anyone!","Obummer, congress is full at the moment."],s=n.length,o=Math.floor(Math.random()*s);e.channel.send(n[o])}}function campaignCongress(e,n){if(congressInDesperateNeed){if(votingCongressID)return void error(e,"Too late! Voting on the new Congress member has already started!");let s=e.author.username,o=!1,r="";for(let e=1;e<n.length;e++)r+=" "+n[e];for(let e=0;e<congressArray.length;e++)congressArray[e]==s&&(o=!0);if(o)return pollTypes.default.title=s+"'s Campaign Platform",pollMsg(pollTypes.default,r),void(o=!1);if(!o)return void error(e,"You can't campaign - you aren't running for Congress!")}}function reason(e,n){let s="";for(let e=1;e<n.length;e++)s+=" "+n[e];pollTypes.default.title="Reason",votingID?pollMsg(pollTypes.default,aaa):pollError(e)}
const Discord=require("discord.js"),client=new Discord.Client;function say(e,n){if(n.length<=1)return void e.channel.send("hey i need some arguments");let l=e.content.replace("-say ","");e.channel.send(l)}function pollError(e){e.channel.send("Error in polling!")}function msg(e,n){return e.channel.send({embed:{color:9094783,description:n}})}function error(e,n){let l;return e||(l=client.guilds.find("name",serverName).channels.find("name",pollChannelName)),e&&(l=e.channel),l.send({embed:{color:11674146,description:"**[Poll error]** "+n}})}function pollMsg(e,n){let l={embed:{color:e.color,title:e.title,description:n}};if(!e.editLast)return client.guilds.find("name",serverName).channels.find("name",pollChannelName).send(l);contendersMsg&&contendersMsg.edit(l)}function startup(e){clearPollChannel(),pollTypes.default.title="The bot is now online!",pollMsg(pollTypes.default,"Discord Democracy bot is currently in "+version+"\n  \n"+welcomeMsg)}client.on("ready",()=>{console.log("Bot started! Yay!"),console.log("Serving "+client.guilds.size+" server(s)."),client.user.setActivity("Counting votes");let e=convertTime(congressUpdateTime);setInterval(congressCountTheFirst,e),e=convertTime(termLimitTime),console.log(e),setInterval(()=>{termLimit()},e),fs.readFile("./congress.json",function(e,n){e?console.log("No congress found. AAAAAAAAAA"):(congressTheSecond=JSON.parse(n),console.log("Loaded the congress"),startup())})}),client.on("message",e=>{try{console.log(e.author.username+": "+e.content);let n=e.content,l=(n=n.replace("-impeach","-poll impeach")).split(" "),o=e.member.roles.has(e.guild.roles.find("name","Developer").id),s=e.member.roles.has(e.guild.roles.find("name","Congress").id),r=e.author.bot;for(let e=l.length-1;e>=0;e--)""!=l[e]&&" "!=l[e]||l.splice(e,1);l.length>0&&("-say"==l[0]&&(o||r)&&say(e,l),"-congress"==l[0]&&o&&congressCountTheFirst(e,l),"-run4congress"!=l[0]||s||runCongress(e,l),"-campaign"!=l[0]||s||campaignCongress(e,l),"-reason"==l[0]&&s&&reason(e,l),"-bill"==l[0]&&s&&bill(e,l),"-poll"==l[0]&&"impeach"==l[1]&&poll(e,l),"-poll"==l[0]&&"impeach"!=l[1]&&s&&poll(e,l),"-exec"==l[0]&&o&&exec(e,l),"-help"==l[0]&&help(e,l),"-run4congress"==l[0]&&s&&e.channel.send("You are already in Congress."),"-poll"!=l[0]||"impeach"==l[1]||s||e.channel.send("You cant start polls, only congress can!"),"-exec"!=l[0]||o||e.channel.send("You're not my master!"))}catch(n){error(e,"```js\n"+n+"```")}}),client.login("NDYyODYwMDMwNTYwMTc0MDgw.Dhn_mQ.QoEZfqI7J5VCD_MIGOjEYSjW-bM");let billPolls=[];function bill(e,n){if("add"==n[1]){let e="";for(let l=2;l<n.length;l++)return e+=n[l],void billPolls.push(e)}if("return"!=n[1])return"send"==n[1]?(pollTypes.default.title="New bill!",pollMsg(pollTypes.default,billPolls.join("\n")),void(billPolls=[])):void 0;e.channel.send(billPolls)}
const version="Alpha Build 1.1.02",welcomeMsg="Not sure how to start a poll? -poll will guide you every step of the way!",serverName="Discord Democracy",pollChannelName="polls",congressSize=3,fs=require("fs"),termLimitTime="10m",congressUpdateTime="10s",congressCampaigningTime="1m",congressVotingTime="1m",minimumPeachInterval="5m",minimumPollInterval="10s",minimumPollDuration="10s",acceptableParamaters=["MANAGE_CHANNELS","KICK_MEMBERS"],commands={"-poll":{user:{add:{end:"@user @role timeLimit",msg:"Polling to give 's3' the role 's4'."},remove:{end:"@user @role timeLimit",msg:"Polling to remove the role 's4' from 's3'."}},role:{create:{end:"roleName timelimit",msg:"Polling to create the role 's3'."},delete:{end:"@role timeLimit",msg:"Polling to delete the role 's3'."},edit:{permissions:{end:"@role parameters timeLimit",msg:"Polling to edit the role 's4' and set its permissions to 's5'."},name:{end:"@role newName timeLimit",msg:"Polling to edit the name of role 's4' to 's5'."},color:{end:"@role hexColor timeLimit",msg:"Polling to edit the color of role 's4' to 's5'."},hoist:{end:"@role boolean timeLimit",msg:"Polling to set the hoist of role 's4' to 's5'."}}},channel:{create:{end:"channelName type timeLimit",msg:"Polling to create the channel 's3'."},add:{end:"channelName timeLimit",msg:"Polling to create the channel 's3'."},delete:{end:"#channel timeLimit",msg:"Polling to remove the channel 's3'."},remove:{end:"#channel timeLimit",msg:"Polling to remove the channel 's3'."},edit:{name:{end:"#channel newName timeLimit",msg:"Polling to rename the channel 's4' to 's5'."},topic:{end:"#channel NEW TOPIC timeLimit",msg:"Polling to set the topic of channel 's4' to 's5'."},position:{end:"#channel positionNumber timeLimit",msg:"Polling to set the position of channel 's4' to 's5'."},permissions:{end:"#channel @role parameter true/false timeLimit",msg:"Polling to set the 's6' permission of 's5' in channel 's4' to 's7'."}}},kick:{end:"@user timeLimit",msg:"Polling to kick the user 's2'"},ban:{end:"userID timeLimit",msg:"Polling to ban the user 's2'"},impeach:{end:"@user timeLimit",msg:"Polling to remove 's2' from the Congress!"}}};let pollTypes={vote:{title:"New vote! by ",color:8104434,editLast:!1},contender:{title:"Current Congress candidates",color:9094783,editLast:!0},results:{title:"The results are in!",color:11674146,editLast:!1},default:{title:null,color:9094783,editLast:!1}};
let votingID,votingArgs,pollCreator,activeCommandUser,lastPollTime=0;function poll(e,o){if(pollCreator=e.author.username,Date.now()-lastPollTime<convertTime(minimumPollInterval))return void error(e,"Last poll was less then "+minimumPollInterval+" ago.");if(votingID)return void error(e,"There is already a vote held right now!");const n=[["461667381056634910","Congress role"],["462449983350636554","Congress channel"],["462449524493778965","polls channel"],["461597485266370563","Developer role"],["460562933538226176","Bot role"]];for(let o=0;o<n.length;o++)if(e.content.replace(n[o][0],"")!=e.content)return void error(e,"You can't vote to affect the "+n[o][1]+".");if(!isLegitCommand(e,o)){let n=commands;for(let r=0;r<o.length;r++){if(null==n[o[r]])return void pollError(e);if(n=n[o[r]],Object.getOwnPropertyNames(n).includes("end"))break}if(Object.getOwnPropertyNames(n).includes("end")){let r="Complete your command as follows: \n";return r+=o.join(" ")+" "+n.end,void msg(e,r)}{let r=Object.getOwnPropertyNames(n),t="Type any of these commands next: \n";return r.map(e=>{t+=o.join(" ")+" "+e+"\n"}),void msg(e,t.replace("-poll impeach",""))}}if("impeach"==o[1]){if(itsPeachy)return void error(e,"You can't impeach that quickly!");if(!itsPeachy){let n=e.guild.roles.find("name","Congress").id,r=client.guilds.find("name",serverName),t=getId(o[2]);if(!r.members.find("id",t).roles.has(n))return void error(e,"This user isn't in congress you idiot.")}}let r=convertTime(o[o.length-1],e);if(!1===r)return;if(r<convertTime(minimumPollDuration))return void error(e,"A poll must at least be "+minimumPollDuration+" long.");let t=commands;for(let e=0;e<o.length&&(null==t[o[e]]||(t=t[o[e]],!Object.getOwnPropertyNames(t).includes("end")));e++);let l=t.msg;l=(l=(l=(l=(l=(l=l.replace("'s2'",o[2])).replace("'s3'",o[3])).replace("'s4'",o[4])).replace("'s5'",o[5])).replace("'s6'",o[6])).replace("'s7'",o[7]),msg(e,"Starting new poll! Check #polls to vote!"),msg(e,"Add a reason for the poll with: -reason your reason for this poll"),clearPollChannel(),pollTypes.vote.title="New poll! by "+pollCreator,pollMsg(pollTypes.vote,l).then(e=>{e.react("👍").then(()=>{e.react("👎").catch(console.error)}).catch(console.error),votingArgs=o,votingID=e.id,setTimeout(()=>{countVotes()},r)}).catch(console.error)}function countVotes(){if(!votingArgs||!votingID)return void error(null,"I don't know how to "+args[2]+" a channel. Please check `-help commands` for the available commands.");let e=client.guilds.find("name",serverName).channels.find("name",pollChannelName).messages.find("id",votingID),o=e.reactions.get("👎").count-1,n=e.reactions.get("👍").count-1,r="There were "+n+" yes votes and "+o+" no votes";n>o?(pollMsg(pollTypes.results,r+"\nThe vote passes!"),"channel"==votingArgs[1]&&channel(votingArgs),"role"==votingArgs[1]&&role(votingArgs),"user"==votingArgs[1]&&user(votingArgs),"ban"!=votingArgs[1]&&"kick"!=votingArgs[1]||kickBan(votingArgs),"impeach"==votingArgs[1]&&impeach(votingArgs)):n<=o&&pollMsg(pollTypes.results,r+"\nThe vote fails!"),votingID=null,votingArgs=null}
function channel(e){let l=client.guilds.find("name",serverName);if(("add"==e[2]||"create"==e[2])&&e.length>=5){let i="";i.replace("-"," ");for(let l=3;l<e.length-1;l++)i+=" "+e[l];let n="";return n=e[e.length-2],void l.createChannel(i,n)}if(("delete"==e[2]||"remove"==e[2])&&5==e.length){let i=e[3];return i=i.replace("<","").replace(">","").replace("#",""),console.debug(i),void l.channels.find("id",i).delete()}if("edit"!=e[2])error(null,"I don't know how to "+e[2]+" a channel. Please check `-help commands` for the available commands.");else{let i=getId(e[4]);if("name"==e[3])l.channels.find("id",i).edit({name:e[5]});else if("position"==e[3])l.channels.find("id",i).edit({position:e[5]});else if("topic"==e[3]){let n="";for(let l=5;l<e.length-1;l++)n+=" "+e[l];l.channels.find("id",i).edit({topic:n})}else if("type"==e[3])l.channels.find("id",i).edit({type:e[4]});else if("permissions"==e[3]){let n=getId(e[5]),t=e[6],d="true"==e[7];"view"==t?l.channels.find("id",i).overwritePermissions(n,{VIEW_CHANNEL:d}):"send"==t&&l.channels.find("id",i).overwritePermissions(n,{SEND_MESSAGES:d})}}}function user(e){let l=client.guilds.find("name",serverName);if("add"!=e[2]||6!=e.length)if("remove"!=e[2]||6!=e.length);else{let i=getId(e[4]),n=getId(e[3]),t=l.roles.find("id",i);l.members.find("id",n).removeRole(t)}else{let i=getId(e[4]),n=getId(e[3]),t=l.roles.find("id",i);l.members.find("id",n).addRole(t)}}function role(e){let l=client.guilds.find("name",serverName);if("create"!=e[2]||5!=e.length)if("delete"!=e[2]||5!=e.length){if("edit"==e[2]){let i=getId(e[4]);i=i.replace("@","").replace("<","").replace(">","").replace("&","");let n=l.roles.find("id",i);if("permissions"==e[3]){let l=[];for(let i=5;i<e.length-1;i++)acceptableParamaters.includes(e[i])&&l.push(e[i]);n.edit({permissions:[l]}),l=[]}else if("color"==e[3]){let l=hexToRgb(e[5]);console.log([l.r,l.g,l.b]),n.edit({color:[l.r,l.g,l.b]})}else if("name"==e[3]){let l="";for(let i=6;i<e.length-1;i++)l+=e[i];n.edit({name:l})}else{if("hoist"!=e[3])return void error(null,"I don't know how to "+e[2]+" a role. Please check `-help commands` for the available commands.");{let l="true"==e[5];n.edit({hoist:l})}}}}else{let i=getId(e[3]);l.roles.find("id",i).delete()}else{let i=e[3];l.createRole({name:i,mentionable:!0})}}function kickBan(e){let l=client.guilds.find("name",serverName);if("ban"==e[1]&&4==e.length){let i=getId(e[2]);l.members.find("id",i).ban()}else if("kick"==e[1]&&4==e.length){let i=getId(e[2]);l.members.find("id",i).kick()}else error(null,"I don't know how to "+e[1]+" a user. Please check `-help commands` for the available commands.")}
function getId(e){if(e.replace("everyone")!=e){return client.guilds.find("name",serverName).roles.find("name","@everyone")}return e.replace(/[^0-9.]/g,"")}function hexToRgb(e){for(var n=[],t=0;t<e.length-1;t+=2)n.push(parseInt(e.substr(t,2),16));return String.fromCharCode.apply(String,n)}function exec(message,args){let runCode=message.content.replace("-exec ",""),result;try{result=eval("(function() {"+runCode+"}())")}catch(e){result=e.message}null!=result&&message.channel.send("```js\n"+result+"```")}function isLegitCommand(e,n){let t=commands,o=0;for(let e=0;e<n.length;e++){if(null==t[n[e]])return!1;if(t=t[n[e]],o++,Object.getOwnPropertyNames(t).includes("end"))return o<n.length}return!1}function clearPollChannel(){let e=client.guilds.find("name",serverName).channels.find("name",pollChannelName);e.fetchMessages({limit:99}).then(n=>{e.bulkDelete(n)})}function convertTime(time,message){try{return time=time.replace("s"," * 1000 + 0"),time=time.replace("m"," * 60000 + 0"),time=time.replace("h"," * 3600000 + 0"),eval("(function() { return ("+time+"); }())")}catch(e){return null!=message&&error(message,"Time limit not formatted right."),!1}}function saveCongress(){var e=JSON.stringify(congressTheSecond);fs.writeFile("./congress.json",e,function(e){if(e)return console.log("There was an error saving the congress."),void console.log(e.message);console.log("Saved the congress!")})}function help(e,n){msg(e,"\n    ***Help***\n    For information about the existing roles, try -help roles \n\n    For help with commands, try -help commands \n\n    If you want to understand the bot functionality and purpose, try -help functionality \n\n    For information about the bot, try -help about \n\n    \n\n    If you need any other help please contact a @Developer\n  "),"roles"==n[1]?msg(e,"\n    ***Congress:*** \n\n    **What is this role:** The Congress role is the only role that can start -poll commands. \n\n    This allows the Congress to represent the people and make polls that they want to see without pointless polls being made by trolls. \n\n    They have access to a special #congress channel to discuss things amongst themselves. Any Congress member can be impeached and all are voted in by the people. \n\n    **How do I get this role?** You get this role by winning an election for congress. There are currently "+congressSize+" seats for congress that must be filled at all times. \n\n    If all of the seats aren't filled, a vote will automatically start prompting users to run for congress to fill the seat. Vacancies occur upon resignations, impeachments, or end of term limits which are currently set to "+termLimitTime+" \n\n    **How do I impeach members of Congress:** If you feel a congress member isn't doing a good job and want them gone before their term is up, simply trigger a vote using \n -impeach userID timelimit (e.g. 5m30s) \n\n    **Is this role staff or admin?** No, this role is not any form of server staff. This role's sole purpose is to start votes for the people. \n\n    \n\n    ***Developer:*** \n\n    **What is this role:** This role is for the developers of the bot. It gives full permissions neccessary to perform testing, maintenance, etc. It is not primarily used to admin or mod the server, as that is up to the community. \n\n    **How do I get this role:** If you're interested in helping out, let a Developer know. Though, we are not looking for developers at the moment we appreciate bug reports and suggestions. \n\n    \n\n    ***Bot:*** \n\n    **What is this role:** This role is for the Discord Democracy bot and gives it the permissions to do what it needs. \n\n    ***Any other role:*** Any other role not listed here is a community made role with the bot. These can serve any purpose and be removed or changed at any time.\n    "):"commands"==n[1]?(msg(e,"\n      Only congress can initiate polling commands. Polling commands are always initated with \n `-poll` \n\n      `timeLimit` can be formatted using s, m and h, eg. `5m30s`\n      \n\n      ***Server Roles:*** \n\n      To **add** a role to the server: \n `-poll role create [desiredRoleName] timelimit` \n\n      To **delete** a role from the server: \n  `-poll role delete @role timelimit` \n\n      To **edit** a role on the server: \n\n      *Permissions:* \n Add any of the options exactly as they are typed and the role will be reconfigured with the permissions listed. Only the options listed below currently are editable.\n\n      Available Options: "+acceptableParamaters+" \n\n      `-poll role edit @role permissions [DESIRED_PERMISSION1 DESIRED_PERMISSION2 etc.] timeLimit` \n\n      *Color:* \n `-poll role edit @role color [colorHex] timelimit ` \n\n      *Name:* \n ` -poll role edit @role name [newName] timelimit ` \n\n      *Hoist:* \n ` -poll role edit @role hoist [true or false] timelimit ` \n\n\n      \n\n      ***User Roles:*** \n\n      To **add** a role to a user: \n  `-poll role add @role @user timelimit` \n\n      To **remove** a role from a user: \n `-poll role remove @role @user timelimit` \n\n      \n "),msg(e,"\n      ***Channels:*** \n\n      To **add** a channel: \n `-poll channel add/create desiredChannelName timelimit` \n\n      To **remove** a channel: \n `-poll channel remove/delete #channel timelimit` \n\n      To **edit** a channel: \n\n      *Channel Name:* \n `-poll channel edit #channel name [newName] timelimit `\n      *Channel Topic:* \n `-poll channel edit #channel topic [new topic string] timelimit ` \n\n      *Channel Position:* \n `-poll channel edit #channel position [number of new position] timelimit ` \n\n      *Channel Permissions:* \n\n      ` -poll channel edit #channel permissions @roleAffected [view/send] [true/false] timelimit` \n\n      \n\n      ***Moderation:*** \n\n      To **kick** a user: \n `-poll kick @user timelimit` \n\n      To **ban** a user: \n `-poll ban @user timelimit` \n\n      \n\n      ***Impeach:*** \n\n      To impeach a member of congress: \n `-impeach @user timeLimit` \n\n      ")):"functionality"==n[1]?msg(e,"\n      ***Functionality***\n      This server is special in that there are no admins or mods, just the community. Every change is polled on by the users and must pass for any changes to take effect. \n\n      This bot functions by allowing users to vote on any polls that Congress starts. Congress has the ability to poll things, with more polling options being added each day. \n\n      Congress can access poll commands and get help in the #congress chat from each other or Developers. Congress is elected by popular vote anytime a seat is vacant. \n\n      Seats can be made vacant if a member resigns, or if their term is up. Terms are currently "+termLimitTime+" and the amount of seats is currently "+congressSize+" \n\n      If the community dislikes any member of Congress, they can impeach them. Otherwise, the community tells Congress what they want to vote on and then polls are made to allow them to vote. \n\n      Votes can consist of roles, channels, permissions, special abilities, banning or kicking a user, etc. \n\n      "):"about"==n[1]&&msg(e,"\n      ***About***\n      This bot runs the entire server allowing it to be an unbiased center for Democracy ran by The People. \n\n      This bot is currently in "+version+"\n\n      This bot was created by ContemplativePanda and Merijndh.\n\n      For questions, bug reports, or suggestions please contact a @Developer\n      ")}