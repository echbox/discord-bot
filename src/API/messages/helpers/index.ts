import { Message } from 'discord.js';
import { COMMAND_PREFIX, COMMAND_SEPARATOR } from 'src/config';

const processCommand = (message: string) => {
  const commandBody = message.slice(COMMAND_PREFIX.length);
  const [command, arg] = commandBody.split(COMMAND_SEPARATOR, 2);

  return [command.toLowerCase(), arg];
};

const properMessage = (message: Message<boolean>) => {
  const isBot = message.author.bot;
  const isDm = message.channel.type === 'DM';
  if (isBot || !isDm) return false;
  return true;
};

const isCommand = (message: string) => message.startsWith(COMMAND_PREFIX);

export { processCommand, properMessage, isCommand };
