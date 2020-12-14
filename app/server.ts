import Discord from "discord.js";

import { Config } from "./config";
import { createContext } from "./context";
import { createDataSources } from "./dataSources/dataSources";
import { createKnex } from "./database/connection";
import { handleMessage } from "./discord";
import { handleError } from "./handlers/onError";
import { handleOnReady } from "./handlers/onReady";
import { createLogger } from "./logger";
import { createServices } from "./services/services";

export const createServer = ({ config }: { config: Config }) => {
  const logger = createLogger({ config });
  const knex = createKnex({ config });
  const services = createServices({ config, logger });
  const dataSources = createDataSources({ config, logger, knex });
  const context = createContext({
    logger,
    services,
    dataSources,
  });

  const client = new Discord.Client();

  client.on("ready", handleOnReady({ client, context }));

  client.on("error", handleError({ logger }));

  client.on("message", handleMessage(context));

  return client;
};
