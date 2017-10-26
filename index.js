const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
const sql = require('sqlite');
const custom_commands = sql.open('commands.sqlite');


fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    console.log(eventName)
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    try{
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
    } catch (err) {
        console.log(err);
    }
  });
});

client.on("message", (message) => {  
try{
  if (message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  if (message.channel.type === "dm") return; 
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "prefix") {
      var items = message.content.split(/\s+/);
      if(items.length != 2 || items[1].length != 1){
        message.channel.send("Please use for the format of " + config.prefix + "prefix followed by a single character")
        return;
      }
      config.prefix = message.content.split(/\s+/)[1];
      fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
      message.channel.send("The prefix is now " + config.prefix);
  }
  
  if (command === "add-tag"){
     var author = message.author.id.toString();
     if(args.length < 2){
        message.channel.send("Please include a message to save.");
     }
     else{
        var [new_command, ...new_message] = args;
        console.log(new_command, "MADE COMMAND\n", new_message.join(" "));
        try{
            sql.get(`SELECT * FROM commands WHERE command ="${args[0]}"`).then(row => {
                if (!row) {
                    console.log();
                    sql.run("INSERT INTO commands (userId, command, message) VALUES (?, ?, ?)", [author, new_command, new_message.join(" ")]).then(row =>{
                    message.channel.send("Saved a new tag with " + args[0]);                        
                    });
                    
                } else {
                    message.channel.send("That tag already exists.");
                }
            })
        } catch (err) {
            message.channel.send("Something went wrong, tell Juzo");
            console.log("oh no")
        }
     }
     return;
  }

  if (command === "tags"){
    var author = message.author.id.toString();
    try{
        sql.all(`SELECT command FROM commands WHERE userId ="${author}"`).then(row=> {
            var message_to_return = [];
            row.forEach(item => {
                console.log(item.command);
                message_to_return.push(item.command);
            })
            message.channel.send("You have the following commands " + message_to_return.join(",") + ".")
        })
    } catch (err) {
        console.log("Failed")
    }
    return;
  }

  if (command === "remove-tag") {
    console.log("remove tag")
    var author = message.author.id.toString();
    try{
        if(author == '12068783246016512'){
            sql.get(`SELECT * FROM commands WHERE command ="${args[0]}"`).then(row => {
                if (!row) {
                    message.channel.send("No commands exist with that tag.")
                } else {
                    sql.run(`DELETE FROM commands WHERE command ="${args[0]}"`).then(row =>{
                        message.channel.send("Successfully deleted command");
                    })
                    return;
                    }
                });
        }
        else{
            // See if command exists
             sql.get(`SELECT * FROM commands WHERE command ="${args[0]}" AND userId ="${author}"`).then(row => {
                if (!row) {
                    message.channel.send("No commands exist with that tag.")
                } else {
                    sql.run(`DELETE FROM commands WHERE command ="${args[0]}" AND userId ="${author}"`).then(row =>{
                        message.channel.send("Successfully deleted command");
                    })
                    return;
                    }
                });
            }
    } catch (err) {

    }
    return;
  }

  try {
    let commandFile = require(`./commands/${command}.js`);
    commandFile.run(client, message, args);
  } catch (err) {
      sql.get(`SELECT * FROM commands WHERE command ="${command}"`).then(row => {
        console.log(row)
    if (!row) {
        message.channel.send("No commands exist with that tag.")
    } else {
        message.channel.send(row.message);
        return;
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS commands (userId TEXT, command TEXT, message TEXT)").then(() => {
      sql.run("INSERT INTO commands (userId, command, message) VALUES (?, ?, ?)", [1111, kip, 'fuck kip']);
    });
  });
  }




    }
    catch (error) {
        console.log(error, "ERROR", message.content);
    }
});


client.login(config.token);
