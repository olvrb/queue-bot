const Discord = require("discord.js");
const config = require("./config.js");
const client = new Discord.Client();

let channel;


const queue = [];

const timeBetween = 0.25 * 60;
client.on("message", message => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "join") {
        if (queue.find(x => x.user === message.author.id)) return message.reply("already in queue...");
        let startTime = now() + timeBetween;
        if (queue.length > 0) startTime = queue[queue.length - 1].startTime + timeBetween;
        queue.push({ user: message.author.id, startTime /* Add 10 minutes */ });
        message.reply("added to queue.");
    }
    if (command === "queue") {
        message.channel.send(queue);
    }
    if (command === "timeleft") {
        const out = timeLeft(message.author.id);
        if (out === -1) return message.reply("not in queue.");
        message.reply(out);
    }
});

function timeLeft(id) {
    const user = queue.find(x => x.user === id);
    if (!user) return -1;
    return millisToMinutesAndSeconds(((user.startTime) - now()) * 1000);
}

function now() {
    return Math.floor(Date.now() / 1000);
}



client.on("ready", () => {
    channel = client.channels.get("635745634816884746");
    setInterval(updateQueue, 1000);
    setInterval(updateMessage, 5000);
});

async function updateMessage() {
    const messageChannel = client.channels.get("635787016105099264");
    const message = await messageChannel.fetchMessage("635787460001136649");
    message.edit(`${queue.map((x) => `<@${x.user}>: ${timeLeft(x.user)}`).join("\n")}`);
}



function updateQueue() {
    if (queue.length <= 0) return;
    if (queue[0].startTime < now()) {
        channel.send(`<@${queue[0].user}>'s turn.`);
        queue.shift();
    }
}

client.login(config.token).then(() => {
    console.log("Logged in.");
});


function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
