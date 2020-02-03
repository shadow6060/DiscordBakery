import { EmbedField, GuildMember, GuildChannel } from "discord.js";
import { permissions } from "../../modules/permissions";
import { Command } from "@db-struct/command.struct";
import moment = require("moment-timezone");
import { Status } from "@db-module/sql";
export const command = new Command("deliver", "Deliver an order.", [], ["pp"], [] as const, permissions.staff)
	.setExec(async(client, message, args, lang) => {
		const order = await client.getClaimedOrder(message.author.id);
		if (!order) return message.channel.send(lang.errors.noClaimedOrder);
		if (order.status !== Status.PENDING_DELIVERY) return message.channel.send(lang.errors.notDelivering);
		const channel = client.channels.get(order.metadata.channel) as GuildChannel;
		const guild = channel?.guild;
		const invite = await channel.createInvite({ maxUses: 1, maxAge: 600000, reason: "Drink delivery", unique: true, temporary: true });
		if (!guild || !channel) return message.channel.send("[no]");
		const embed = new client.Embed()
			.setTitle(`Delivery Info for \`${order.id}\``)
			.setDescription(`Information needed to deliver the order \`${order.id}\``)
			.addField("Channel", `**#${channel?.name ?? "unknown"}** (ID: ${channel.id})`)
			.addField("Invite", `[Join the guild](${invite.url})`);
		if (channel) embed.addField("Guild", `**${guild.name}** (ID: ${guild.id})`);
		await message.author.send(embed);
		await message.react("[yes]");
	});
