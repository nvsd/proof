import { createConsola, type LogType } from 'consola';

const baseLogger = createConsola({
  level: 3,
  // @ts-expect-error - consola has a fancy option
  fancy: true,
});

export const logger = baseLogger.withTag('web');

export const createModuleLogger = (module: string) => {
  return logger.withTag(module);
};

export type { LogType };
