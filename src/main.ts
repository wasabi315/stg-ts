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
        },
        expr: {
          prim: '+#',
          args: ['x', 1],
        },
      },
    },
  };

  console.log(prettyprint(program));
}

main();
