import CommandParameter from '/api/command/CommandParameter.ts';

export default new class StringParameter implements CommandParameter<string> {
  parse(str: string): string {
    return str;
  }

  defaultValue = '';
}();
