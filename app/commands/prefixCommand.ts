import { AbstractCommand } from "~/commands/AbstractCommand";
import { Command } from "~/commands/commands";
import { responseUtils } from "~/utils/responseUtils";

const PREFIX_MAX_LENGTH = 15;

class PrefixCommand extends AbstractCommand {
  async execute() {
    if (this.message.guild.ownerID !== this.message.author.id) {
      return;
    }

    const { prefix } = await this.dataSources.guildDS.tryGetGuild({
      guildDiscordId: this.message.guild.id,
    });

    if (this.args.length === 0) {
      const embed = responseUtils
        .positive({ discordUser: this.message.author })
        .setTitle("Prefix")
        .addField("Change your prefix by", `${prefix}prefix <value>`);

      return await this.message.channel.send(embed);
    }

    const newPrefix = this.args.join(" ");

    if (newPrefix.length > PREFIX_MAX_LENGTH) {
      const embed = responseUtils
        .negative({ discordUser: this.message.author })
        .setTitle("Prefix error")
        .setDescription(
          `Maximum length for the prefix is ${PREFIX_MAX_LENGTH} cahracters`,
        )
        .addField("Your prefix is too long", newPrefix);

      return await this.message.channel.send(embed);
    }

    await this.dataSources.guildDS.modifyGuild({
      guildDiscordId: this.message.guild.id,
      newPrefix: newPrefix,
    });

    const embed = responseUtils
      .positive({ discordUser: this.message.author })
      .setTitle("Prefix updated")
      .addField("Your new prefix", newPrefix)
      .addField("Example usage", `${newPrefix}prefix`);

    await this.message.channel.send(embed);
  }
}

export const prefixCommand: Command = {
  emoji: "⚛️",
  name: "Prefix",
  command: "prefix",
  aliases: [],
  syntax: "<value>",
  examples: ["#"],
  isAdmin: true,
  description: "Chang the prefix of your server",

  getCommand(payload) {
    return new PrefixCommand(payload);
  },
};
