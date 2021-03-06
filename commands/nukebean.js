const { emoji } = require("../config.json");
const { dbModifyId, dbQuery } = require("../coreFunctions");
module.exports = {
	controls: {
		permission: 0,
		usage: "nukebean <member> (reason)",
		description: "Nukebeans a member from the server",
		enabled: true,
		hidden: false,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS"]
	},
	do: async (message, client, args, Discord) => {

		if (!args[0]) return message.channel.send("You must specify a member!");
		let member = message.mentions.members.first() || message.guild.members.find((user) => user.id === args[0]);
		if (!member) return message.channel.send(`<:${emoji.x}> Could not find server member \`${args[0]}\``);

		let reason = args[1] ? args.splice(1).join(" ") : "No reason specified";

		let beanSendEmbed = new Discord.RichEmbed()
			.setColor("#AAD136")
			.setDescription(reason)
			.setImage("https://media.tenor.com/images/334d8d0f9bf947f31256cdaacc7f6cf0/tenor.gif");

		if (!global.beans) global.beans = [];
		global.beans[member.id] = {
			count: 0
		};
		client.on("message", (message) => {
			if (message.author.id === member.id && global.beans[member.id].count < 5) {
				message.react("nukebean:666102191895085087");
				global.beans[member.id].count++;
			}
		});

		let qMemberDB = await dbQuery("User", { id: member.id });
		let qSenderDB = await dbQuery("User", { id: message.author.id });
		if (!qMemberDB || !qMemberDB.beans) await dbModifyId("User", member.id, { beans: {
			sent: {
				bean: { type: Number, default: 0 },
				megabean: { type: Number, default: 0 },
				nukebean: { type: Number, default: 0 }
			},
			received: {
				bean: { type: Number, default: 0 },
				megabean: { type: Number, default: 0 },
				nukebean: { type: Number, default: 0 }
			}
		}
		});
		if (!qSenderDB || !qSenderDB.beans) await dbModifyId("User", message.author.id, { beans: {
			sent: {
				bean: { type: Number, default: 0 },
				megabean: { type: Number, default: 0 },
				nukebean: { type: Number, default: 0 }
			},
			received: {
				bean: { type: Number, default: 0 },
				megabean: { type: Number, default: 0 },
				nukebean: { type: Number, default: 0 }
			}
		}
		});

		let memberSentBeanCount = qMemberDB.beans.sent;
		let memberReceivedBeanCount = {
			bean: qMemberDB.beans.received.bean,
			megabean: qMemberDB.beans.received.megabean,
			nukebean: qMemberDB.beans.received.nukebean+1
		};
		let senderReceivedBeanCount = qSenderDB.beans.received;
		let senderSentBeanCount = {
			bean: qSenderDB.beans.sent.bean,
			megabean: qSenderDB.beans.sent.megabean,
			nukebean: qSenderDB.beans.sent.nukebean+1
		};
		await dbModifyId("User", member.id, { beans: { sent: memberSentBeanCount, received: memberReceivedBeanCount } });
		await dbModifyId("User", message.author.id, { beans: { sent: senderSentBeanCount, received: senderReceivedBeanCount } });

		message.channel.send(`<:nukebean:666102191895085087> Nukebeaned ${member.user.tag} (\`${member.id}\`)`, beanSendEmbed);
		member.user.send(`<:nukebean:666102191895085087> **You have been nukebeaned from ${message.guild.name}**`, beanSendEmbed)
			.catch(() => {});
	}
};
