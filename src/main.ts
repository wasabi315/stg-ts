import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';

async function main() {
  const program: ast.Program = {
    main: {
      free: [],
      updatable: true,
      args: [],
      expr: {
        rec: true,
        binds: {
          x: {
            free: [],
            updatable: true,
            args: [],
            expr: {
              constr: 'Int#',
              args: [1],
            },
          },
          y: {
            free: [],
            updatable: true,
            args: [],
            expr: {
              constr: 'Int#',
              args: [1],
            },
          },
          z: {
            free: ['x', 'y'],
            updatable: true,
            args: [],
            expr: {
              var: 'add',
              args: ['x', 'y'],
            },
          },
        },
        expr: {
          var: 'add',
          args: ['z', 'z'],
        },
      },
    },
    add: {
      free: [],
      updatable: false,
      args: ['x', 'y'],
      expr: {
        expr: {
          var: 'x',
          args: [],
        },
        alts: [
          {
            constr: 'Int#',
            vars: ['x#'],
            expr: {
              expr: {
                var: 'y',
                args: [],
              },
              alts: [
                {
                  constr: 'Int#',
                  vars: ['y#'],
                  expr: {
                    expr: {
                      prim: '+#',
                      args: ['x#', 'y#'],
                    },
                    alts: [
                      {
                        var: 'z#',
                        expr: {
                          constr: 'Int#',
                          args: ['z#'],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };

  console.log(prettyprint(program));

  const interpreter = createInterpreter(program);
  for (const state of interpreter) {
    console.dir(state, { depth: null });
  }
}

main();
