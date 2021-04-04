import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';
import { Int, traceInt, fact } from '~/programs';

const captureStdout = (fn: () => unknown): string => {
  const origWrite = process.stdout.write.bind(process.stdout);

  let out = '';
  process.stdout.write = ((chunk: string | Uint8Array) => {
    if (typeof chunk === 'string') {
      out += chunk;
    }
  }) as typeof origWrite;
  fn();
  process.stdout.write = origWrite;

  return out;
};

const run = (program: ast.Program): void => {
  console.group('Program');
  console.log(prettyprint(program));
  console.groupEnd();
  console.log();

  const interpreter = createInterpreter(program);
  let out: string;
  try {
    // Run interpreter
    out = captureStdout(() => {
      for (const _ of interpreter);
    });
  } catch (err) {
    out = `Program exited with error: ${
      err instanceof Error ? err.message : err
    }`;
  }
  console.log('Result');
  console.group();
  console.log(out);
  console.groupEnd();
};

const main = () => {
  const program: ast.Program = {
    main: {
      free: [],
      updatable: true,
      args: [],
      expr: {
        rec: true,
        binds: {
          ['20']: {
            free: [],
            updatable: true,
            args: [],
            expr: Int(20),
          },
          res: {
            free: ['20'],
            updatable: true,
            args: [],
            expr: {
              var: 'fact',
              args: ['20'],
            },
          },
        },
        expr: {
          var: 'traceInt',
          args: ['res'],
        },
      },
    },
    ...fact,
    ...traceInt,
  };

  run(program);
};

main();
