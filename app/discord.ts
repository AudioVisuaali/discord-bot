import { Message } from "discord.js";

import { invokeCommand } from "./commands/commands";
import { Context } from "./context";

export type HandleMessage = (
  context: Context,
) => (message: Message) => Promise<void>;

export const handleMessage: HandleMessage = (context) => async (message) => {
  if (!message.guild) {
    return;
  }

  if (message.author.bot) {
    return;
  }

  if (message.channel.type === "dm") {
    return;
  }

  context.logger.info("User sent message", {
    authorId: message.author.id,
    authorName: message.author.username,
    authorDiscriminator: message.author.discriminator,
    message: message.content,
  });

  const isUserTimedOut = context.services.timeout.isUserTimedOut({
    userDiscordId: message.author.id,
  });

  if (isUserTimedOut) {
    return;
  }

  const guildId = message.guild.id;
  const prefix = await getServerWithCreate({ context, guildId });

  if (!message.content.startsWith(prefix)) {
    return;
  }

  await context.dataSources.userDS.verifyUser({
    userDiscordId: message.author.id,
  });

  invokeCommand({
    message,
    prefix,
    context: context,
  });
};

const getServerWithCreate = async (opts: {
  context: Context;
  guildId: string;
}) => {
  const serverDL = await opts.context.dataSources.guildDS.getGuild({
    guildDiscordId: opts.guildId,
  });

  if (serverDL) {
    return serverDL.prefix;
  }

  const server = await opts.context.dataSources.guildDS.verifyGuild({
    guildDiscordId: opts.guildId,
  });

  return server.prefix;
};
