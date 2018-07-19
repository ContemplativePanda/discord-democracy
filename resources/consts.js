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


const version = "Alpha Build 1.1.02";
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
