import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

import { DataSourceWithContext } from "./DataSourceWithContext";

import { Table, UserTableRaw } from "~/database/types";

export type UserTable = {
  id: number;
  UUID: string;
  discordId: string;
  points: number;
  bank: number;
  xp: number;
  tokens: number;
  dailyRetrieved: DateTime | null;
  createdAt: DateTime;
  updatedAt: DateTime | null;
};

export class UserDataSource extends DataSourceWithContext {
  private formatRow(row: UserTableRaw): UserTable {
    return {
      id: row.id,
      UUID: row.uuid,

      discordId: row.discordId,
      points: row.points,
      bank: row.bank,
      xp: row.xp,
      tokens: row.tokens,
      dailyRetrieved: row.dailyRetrieved
        ? DateTime.fromJSDate(row.dailyRetrieved)
        : null,
      createdAt: DateTime.fromJSDate(row.createdAt),
      updatedAt: row.updatedAt ? DateTime.fromJSDate(row.updatedAt) : null,
    };
  }

  public async getUser(opts: { userDiscordId: string }) {
    const user = await this.knex<UserTableRaw>(Table.USERS)
      .where({ discordId: opts.userDiscordId })
      .first();

    return user ? this.formatRow(user) : null;
  }

  public async tryGetUser(opts: { userDiscordId: string }) {
    const user = await this.knex<UserTableRaw>(Table.USERS)
      .where({ discordId: opts.userDiscordId })
      .first();

    if (!user) {
      throw new Error("User was expected");
    }

    return this.formatRow(user);
  }

  public async tryAddMemes(opts: {
    userDiscordId: string;
    addMemesCount: number;
    updateDailyClaimed?: boolean;
  }) {
    const user = await this.tryGetUser({ userDiscordId: opts.userDiscordId });

    const updatedUsers = await this.knex<UserTableRaw>(Table.USERS)
      .where({ discordId: opts.userDiscordId })
      .update({
        points: user.tokens + opts.addMemesCount,
      })
      .returning("*");

    if (updatedUsers.length !== 1) {
      this.logger.error(`Could not add memes to user: ${opts.userDiscordId}`);
      throw new Error(`Could not add memes to user: ${opts.userDiscordId}`);
    }

    return this.formatRow(updatedUsers[0]);
  }

  public async createUser(opts: { userDiscordId: string }) {
    const servers = await this.knex<UserTableRaw>(Table.USERS)
      .insert({
        uuid: uuidv4(),
        discordId: opts.userDiscordId,
      })
      .returning("*");

    if (servers.length !== 1) {
      this.logger.error(`Could not add memes to user: ${opts.userDiscordId}`);
      throw new Error(`Could not add memes to user: ${opts.userDiscordId}`);
    }

    return this.formatRow(servers[0]);
  }

  public async verifyUser(opts: { userDiscordId: string }) {
    const user = await this.getUser({ userDiscordId: opts.userDiscordId });

    if (user) {
      return user;
    }

    return await this.createUser({
      userDiscordId: opts.userDiscordId,
    });
  }
}
