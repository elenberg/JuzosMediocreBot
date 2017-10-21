exports.run = (client, message, args) => {
    if(args.length == 0 || isNaN(args[0])){
        message.channel.send("Please give me a number of sides to use.")
        return;
    }

    var sides = Math.floor(args[0]);
    if(sides < 2){
        message.channel.send("Must have more than 1 side.")
        return;
    }
    var roll = Math.floor(sides * Math.random()) + 1;
    message.channel.send("Rolled a " + args[0] + " die. Got a " + roll).catch(console.error);
}