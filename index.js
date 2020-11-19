const Discord = require('discord.js');
const bot = new Discord.Client();

const superagent = require('superagent');
const nbx = require('noblox.js');

const TOKEN = ""; // Set your bot token here
const PREFIX = ""; // Set your prefix here

const standard = "#ffffff"; // Set the colour of the embed color here (HEX)

bot.on('ready', () => {
    console.log(`${bot.user.username} is online`);
    bot.user.setActivity("tenverse", { type: "WATCHING" }); // Set Bot Status & Presence
});

bot.on("message", function (message) {
    if (message.content.toLowerCase().startsWith(`${PREFIX}help`)) {

        let no_dm = new Discord.MessageEmbed()
            .setColor(standard)
            .setTitle(`Use commands in a Discord Server`)

        if (message.channel.type === 'dm') return message.author.send(no_dm)

        let embed = new Discord.MessageEmbed()
            .setTitle("Commands")
            .setColor(standard)
            .setThumbnail(bot.user.displayAvatarURL())
            .addField("Verification", `**${PREFIX}verify** - Verifies you using the tenverse API\n` +
            `**${PREFIX}userinfo <userID>** - Shows the userinfo for the mentioned user\n`)
            .addField("Credits", `**Author |** [Joshyyy#4795](https://yosh.codes/)\n` +
            `**GitHub |** [Repository](https://github.com/JoshyRBLX/custom-tenverse-bot)\n`)
            .setFooter(`${message.guild.name}`, bot.user.displayAvatarURL())

        message.channel.send(embed)
    }
});

bot.on("message", function (message) {
    if (message.content.toLowerCase().startsWith(`${PREFIX}verify`)) {

        let no_dm = new Discord.MessageEmbed()
            .setColor(standard)
            .setTitle(`Use commands in a Discord Server`)

        if (message.channel.type === 'dm') return message.author.send(no_dm)

        const verifiedrole = message.guild.roles.cache.find(r => r.name === "Verified"); // Change the role name to the verified role of your server
        if (!verifiedrole) {
            return message.channel.send(`There's no role verification role in the server, which means I can't role you.`)
        }

        async function verification() {

            let userID = message.author.id;

            let tenversecheck = new Discord.MessageEmbed()
                .setColor(standard)
                .setTitle(`Checking`)
                .setDescription(`I'm checking the Tenverse Database for your Discord UserID.\nThis might take a while.`)
                .setFooter("Incase this doesn't change within 2 minutes then try again.")

            let msg = await message.channel.send(tenversecheck)

            let { body } = await superagent.get(`https://api.tenverse.link/user/${userID}`)

            console.log(body) // Remove if you don't want the requests to be logged in the console

            if (body.status === "ok") {

                nbx.getPlayerInfo(body.robloxId).then((playerinfo) => {

                    let found = new Discord.MessageEmbed()
                        .setColor(standard)
                        .setTitle(`Verified`)
                        .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${body.robloxId}&width=420&height=420&format=png`)
                        .setDescription(`Welcome **${playerinfo.username}**`)

                    message.member.roles.add(verifiedrole)
                    msg.edit(found)
                });

            } else if (body.status === "error" && body.message === "User not found") {

                let not_verified = new Discord.MessageEmbed()
                    .setColor(standard)
                    .setTitle(`Not Verified`)
                    .setDescription(`It looks like you aren't verified. Please verify yourself by following the steps given on our **[verification website](https://verify.tenverse.link/)**. After you've verified yourself please run the command again.`)
                    .addField(`Response from Tenverse API`, `\`\`\`\n${body.message}\n\`\`\``)

                msg.edit(not_verified)

            } else if (body.status === "error") {

                let error = new Discord.MessageEmbed()
                    .setColor(standard)
                    .setTitle(`Error`)
                    .addField(`Response from Tenverse API`, `\`\`\`\n${body.message}\n\`\`\``)

                msg.edit(error)
            }
        }

        verification()
    }
});

bot.on("message", function (message) {
    if (message.content.toLowerCase().startsWith(`${PREFIX}userinfo`)) {

        let messageArray = message.content.split(" ")
        let command = messageArray[0];
        let args = messageArray.slice(1);

        let no_dm = new Discord.MessageEmbed()
            .setColor(standard)
            .setTitle(`Use commands in a Discord Server`)

        if (message.channel.type === 'dm') return message.author.send(no_dm)

        async function userinfo() {

            let discordIDargs = args[0] || message.author.id;

            let tenversecheck = new Discord.MessageEmbed()
                .setColor(standard)
                .setTitle(`Checking`)
                .setDescription(`I'm checking the Tenverse Database for **${discordIDargs}**.\nThis might take a while.`)

            let msg = await message.channel.send(tenversecheck)

            let { body } = await superagent.get(`https://api.tenverse.link/user/${discordIDargs}`)

            if (body.status === "ok") {

                nbx.getPlayerInfo(body.robloxId).then((playerinfo) => {

                    let discordUser = bot.users.cache.get(discordIDargs)

                    let found = new Discord.MessageEmbed()
                        .setColor(standard)
                        .setTitle(`Userinfo for: ${discordUser.tag}`)
                        .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${body.robloxId}&width=420&height=420&format=png`)
                        .addField(`Discord`, `${discordUser.tag} (${discordUser.id})`)
                        .addField(`Roblox`, `${playerinfo.username} (${body.robloxId})`)

                    msg.edit(found)
                })
            } else if (body.status === "error" && body.message === "User not found") {

                let notverified = new Discord.MessageEmbed()
                    .setColor(standard)
                    .setTitle(`Not Found`)
                    .setDescription(`It looks like that the user you wanted to lookup isn't verified.`)

                msg.edit(notverified)
            }
        }

        userinfo()
    }
});

bot.login(TOKEN);