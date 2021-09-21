import { WatchedImportObjectBuilder } from './WatchedImport.ts';
import type Secret from '../../config/secret.ts';
import { resolve } from '../deps/path.ts';

export type Config = {
  secret: typeof Secret;
};

const importer = new WatchedImportObjectBuilder(
  (path) => {
    const result = import(`file://${path}`);
    return result;
  },
  (oldPath) => resolve(`./config/${oldPath}.ts`),
  {},
);

async function getConfigInternal(): Promise<Config> {
  await importer.import('secret', 'secret');
  return importer.object;
}

const promise = getConfigInternal();

export default async function getConfig() {
  return await promise;
}
