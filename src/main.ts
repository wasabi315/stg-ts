import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';
import { compose, Int, add, mul } from '~/programs';

const run = (program: ast.Program): void => {
  console.log(prettyprint(program));
  const interpreter = createInterpreter(program);
  try {
    for (const state of interpreter) {
      console.dir(state, { depth: null });
    }
  } catch (err: unknown) {
    console.error('Program exited with error: ', (err as Error).message);
    process.exit(1);
  }
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
          ['2']: {
            free: [],
            updatable: true,
            args: [],
            expr: Int(2),
          },
          ['3']: {
            free: [],
            updatable: true,
            args: [],
            expr: Int(3),
          },
          ['5']: {
            free: [],
            updatable: true,
            args: [],
            expr: Int(5),
          },
          add2: {
            free: ['2'],
            updatable: false,
            args: ['x'],
            expr: {
              var: 'add',
              args: ['x', '2'],
            },
          },
          mul3: {
            free: ['3'],
            updatable: false,
            args: ['x'],
            expr: {
              var: 'mul',
              args: ['x', '3'],
            },
          },
        },
        expr: {
          var: 'compose',
          args: ['add2', 'mul3', '5'],
        },
      },
    },
    ...compose,
    ...add,
    ...mul,
  };

  run(program);
};

main();
