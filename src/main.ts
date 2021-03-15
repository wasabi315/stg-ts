import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';

function main() {
  const program: ast.Program = {
    map: {
      free: [],
      updatable: false,
      args: ['f', 'xs'],
      expr: {
        expr: {
          var: 'xs',
          args: [],
        },
        alts: [
          {
            constr: 'Nil',
            vars: [],
            expr: {
              constr: 'Nil',
              args: [],
            },
          },
          {
            constr: 'Cons',
            vars: ['y', 'ys'],
            expr: {
              rec: false,
              binds: {
                fy: {
                  free: ['f', 'y'],
                  updatable: true,
                  args: [],
                  expr: {
                    var: 'f',
                    args: ['y'],
                  },
                },
                mfy: {
                  free: ['f', 'ys'],
                  updatable: true,
                  args: [],
                  expr: {
                    var: 'map',
                    args: ['f', 'ys'],
                  },
                },
              },
              expr: {
                constr: 'Cons',
                args: ['fy', 'mfy'],
              },
            },
          },
        ],
      },
    },
    map1: {
      free: [],
      updatable: false,
      args: ['f'],
      expr: {
        rec: true,
        binds: {
          mf: {
            free: ['f', 'mf'],
            updatable: false,
            args: ['xs'],
            expr: {
              expr: {
                var: 'xs',
                args: [],
              },
              alts: [
                {
                  constr: 'Nil',
                  vars: [],
                  expr: {
                    constr: 'Nil',
                    args: [],
                  },
                },
                {
                  constr: 'Cons',
                  vars: ['y', 'ys'],
                  expr: {
                    rec: false,
                    binds: {
                      fy: {
                        free: ['f', 'y'],
                        updatable: true,
                        args: [],
                        expr: {
                          var: 'f',
                          args: ['y'],
                        },
                      },
                      mfys: {
                        free: ['mf', 'ys'],
                        updatable: true,
                        args: [],
                        expr: {
                          var: 'mf',
                          args: ['ys'],
                        },
                      },
                    },
                    expr: {
                      constr: 'Cons',
                      args: ['fy', 'mfys'],
                    },
                  },
                },
              ],
            },
          },
        },
        expr: {
          var: 'mf',
          args: [],
        },
      },
    },
    const: {
      free: [],
      updatable: false,
      args: ['x', 'y'],
      expr: {
        var: 'x',
        args: [],
      },
    },
    compose: {
      free: [],
      updatable: false,
      args: ['f', 'g'],
      expr: {
        rec: false,
        binds: {
          fg: {
            free: ['f', 'g'],
            updatable: false,
            args: ['x'],
            expr: {
              rec: false,
              binds: {
                gx: {
                  free: ['g', 'x'],
                  updatable: true,
                  args: [],
                  expr: {
                    var: 'g',
                    args: ['x'],
                  },
                },
              },
              expr: {
                var: 'f',
                args: ['gx'],
              },
            },
          },
        },
        expr: {
          var: 'fg',
          args: [],
        },
      },
    },
  };

  console.log(prettyprint(program));
}

main();
