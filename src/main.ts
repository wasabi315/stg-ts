import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';
import { Int, traceInt, fact } from '~/programs';

const run = (program: ast.Program): void => {
  console.group('Program');
  console.log(prettyprint(program));
  console.groupEnd();
  console.log();

  console.group('Result');
  const interpreter = createInterpreter(program);
  try {
    // Run interpreter
    for (const _ of interpreter);
  } catch (err: unknown) {
    console.error(
      'Program exited with error: ',
      err instanceof Error ? err.message : err
    );
  }
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
