import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';

function main() {
  const program: ast.Program = {
    main: {
      free: [],
      updatable: true,
      args: [],
      body: {
        rec: false,
        binds: {
          x: {
            free: [],
            updatable: true,
            args: [],
            body: 1,
          },
          y: {
            free: [],
            updatable: true,
            args: [],
            body: 1,
          },
        },
        expr: {
          prim: '+#',
          args: ['x', 'y'],
        },
      },
    },
    fn: {
      free: [],
      updatable: false,
      args: ['x'],
      body: {
        expr: {
          var: 'x',
          args: [],
        },
        alts: [
          {
            literal: 0,
            expr: 0,
          },
          {
            expr: 100,
          },
        ],
      },
    },
  };

  console.log(prettyprint(program));
}

main();
