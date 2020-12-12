import { Command } from "discord.js";

export const diceCommand: Command = {
  name: "Dice",
  command: "dice",
  aliases: [],
  syntax: "<maxValue?>",
  examples: ["", "10"],
  isAdmin: false,
  description: "Roll the dice",

  execute(message, args, { utils }) {
    if (args.length === 0) {
      const rolled = utils.math.getRandomArbitrary(1, 6);

      const embed = utils.response
        .positive({ discordUser: message.author })
        .setDescription(`:game_die: Dice rolled ${rolled}`);

      return message.channel.send(embed);
    }

    const maxValue = utils.math.parseStringToNumber(args[0]);

    if (maxValue === null) {
      return message.channel.send(":game_die: **| Invalid number**");
    }

    const rolled = utils.math.getRandomArbitrary(1, maxValue);

    const embed = utils.response
      .positive({ discordUser: message.author })
      .setDescription(`:game_die: Dice rolled ${rolled}`);

    return message.channel.send(embed);
  },
};
