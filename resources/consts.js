/*
  [consts.js]
  We specify settings and shit here. Things that need to be saved :)
*/

/*
Discord Democracy Bot
Alpha Build 1.1
Developers:
ContemplativePanda
Merijndh

"What happens when the program codes the programmer" -Smogley
*/


const version = "Alpha Build 1.1.03";
const welcomeMsg = "Not sure how to start a poll? -poll will guide you every step of the way!"

const serverName = "Discord Democracy";
const pollChannelName = "polls";
const congressSize = 3;

const fs = require('fs');
const termLimitTime = "10m"; // why is this 10m? thought it was 30m
const congressUpdateTime = "10s"; //should be 30m
const congressCampaigningTime = "1m"; //should be 1m
const congressVotingTime = "1m"; // should be 1m

const minimumPeachInterval = "5m";
const minimumPollInterval = "10s";
const minimumPollDuration = "10s"; //should be 1m

const acceptableParamaters = ["MANAGE_CHANNELS", "KICK_MEMBERS"];

const nonos = [["461667381056634910", "Congress role"],
               ["462449983350636554", "Congress channel"],
               ["462449524493778965", "polls channel"],
               ["461597485266370563", "Developer role"],
               ["460562933538226176", "Bot role"]];

const commands = {
  "-poll": {
    "user" : {
      "roles" : {
        "add" : {
          format: ["user", "role"],
          end: "@user @role timeLimit",
          msg: "Polling to give 's4' the role 's5'.",
          function: userRolesAdd
        },
        "remove" : {
          format: ["user", "role"],
          end: "@user @role timeLimit",
          msg: "Polling to remove the role 's5' from 's4'.",
          function: userRolesRemove
        }
      }
    },
    "role" : {
        "create" : {
          format: ["x"],
          end: "roleName timelimit",
          msg: "Polling to create the role 's3'.",
          function: createRole
        },
        "delete" : {
          format: ["role"],
          end: "@role timeLimit",
          msg: "Polling to delete the role 's3'.",
          function: deleteRole
        },
        "edit": {
          "permissions" : {
            format: ["role", "role_parameters"],
            end: "@role parameters timeLimit",
            msg: "Polling to edit the role 's4' and set its permissions to 's5'.",
            function: editRole
          },
          "name" : {
            format: ["role", "x"],
            end: "@role newName timeLimit",
            msg: "Polling to edit the name of role 's4' to 's5'.",
            function: editRole
          },
          "color" : {
            format: ["role", "color"],
            end: "@role hexColor timeLimit",
            msg: "Polling to edit the color of role 's4' to 's5'.",
            function: editRole
          },
          "hoist" : {
            format: ["role", "bool"],
            end: "@role boolean timeLimit",
            msg: "Polling to set the hoist of role 's4' to 's5'.",
            function: editRole
          }
        }
    },
    "channel" : {
      "create" : {
        format: ["x", "channel_type"],
        end: "channelName type timeLimit",
        msg: "Polling to create the channel 's3'.",
        function: createChannel
      },
      "add" : {
        format: ["x", "channel_type"],
        end: "channelName timeLimit",
        msg: "Polling to create the channel 's3'.",
        function: createChannel
      },
      "delete" : {
        format: ["channel"],
        end: "#channel timeLimit",
        msg: "Polling to remove the channel 's3'.",
        function: deleteChannel
      },
      "remove" : {
        format: ["channel"],
        end: "#channel timeLimit",
        msg: "Polling to remove the channel 's3'.",
        function: deleteChannel
      },
      "edit" : {
        "name" : {
          format: ["channel", "x"],
          end: "#channel newName timeLimit",
          msg: "Polling to rename the channel 's4' to 's5'.",
          function: editChannel
        },
        "topic" : {
          format: ["channel", "x"],
          end: "#channel NEW TOPIC timeLimit",
          msg: "Polling to set the topic of channel 's4' to 's5'.",
          function: editChannel
        },
        "position" : {
          format: ["channel", "number"],
          end: "#channel positionNumber timeLimit",
          msg: "Polling to set the position of channel 's4' to 's5'.",
          function: editChannel
        },
        "permissions" : {
          format: ["channel", "role", "role_parameters"],
          end: "#channel @role parameter true/false timeLimit",
          msg: "Polling to set the 's6' permission of 's5' in channel 's4' to 's7'.",
          function: editChannel
        }
      }
    },
    "kick": {
      format: ["user"],
      end: "@user timeLimit",
      msg: "Polling to kick the user 's2'",
      function: kick
    },
    "ban": {
      format: ["user"],
      end: "@user timeLimit",
      msg: "Polling to ban the user 's2'",
      function: ban
    }
  }
}

let pollTypes = {
  vote: {
    title: "New vote! by ", color: 0x7ba9f2, editLast: false
  },
  contender: {
    title: "Current Congress candidates", color: 0x8ac67f, editLast: true
  },
  results: {
    title: "The results are in!", color: 0xB22222, editLast: false
  },
  default: {
    title: null, color: 0x8ac67f, editLast: false
  }
};
