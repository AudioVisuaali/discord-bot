import { AbstractCommand } from "~/commands/AbstractCommand";
import { Command } from "~/commands/commands";
import { validateFormatMessageKey } from "~/translations/formatter";
import { responseUtils } from "~/utils/responseUtils";

class DadJokeCommand extends AbstractCommand {
  private createEmbed(params: { description: string }) {
    return responseUtils
      .positive({ discordUser: this.message.author })
      .setTitle(this.formatMessage("commandDadJokeTitle"))
      .setDescription(params.description);
  }

  public async execute() {
    const dadJoke = await this.services.jokes.getDadJoke();

    const embed = this.createEmbed({
      description: dadJoke.attachments[0].text,
    });

    await this.message.channel.send(embed);
  }
}

export const dadJokeCommand: Command = {
  emoji: "👨",
  name: validateFormatMessageKey("commandDadJokeMetaName"),
  description: validateFormatMessageKey("commandDadJokeMetaDescription"),
  command: "dadjoke",
  aliases: ["dad"],
  syntax: "",
  examples: [],
  isAdmin: false,

  getCommand(payload) {
    return new DadJokeCommand(payload);
  },
};
