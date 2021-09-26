import CommandInfo from '/api/command/CommandInfo.ts';

export default interface LoadedCommand<T> {
  info: CommandInfo<T>;
}
