import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';

const program1: ast.Program = {
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

const program2: ast.Program = {
  main: {
    free: [],
    updatable: true,
    args: [],
    expr: {
      rec: true,
      binds: {
        ['1']: {
          free: [],
          updatable: true,
          args: [],
          expr: {
            constr: 'Int#',
            args: [1],
          },
        },
        const1: {
          free: ['1'],
          updatable: false,
          args: [],
          expr: {
            var: 'const',
            args: ['1'],
          },
        },
      },
      expr: {
        var: 'fix',
        args: ['const1'],
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
  fix: {
    free: [],
    updatable: false,
    args: ['f'],
    expr: {
      rec: true,
      binds: {
        x: {
          free: ['f', 'x'],
          updatable: true,
          args: [],
          expr: {
            var: 'f',
            args: ['x'],
          },
        },
      },
      expr: {
        var: 'x',
        args: [],
      },
    },
  },
};

const program3: ast.Program = {
  main: {
    free: [],
    updatable: true,
    args: [],
    expr: {
      rec: true,
      binds: {
        ['1']: {
          free: [],
          updatable: true,
          args: [],
          expr: {
            constr: 'Int#',
            args: [1],
          },
        },
        nil: {
          free: [],
          updatable: false,
          args: [],
          expr: {
            constr: 'Nil',
            args: [],
          },
        },
        cons1: {
          free: ['1', 'nil'],
          updatable: true,
          args: [],
          expr: {
            constr: 'Cons',
            args: ['1', 'nil'],
          },
        },
        cons2: {
          free: ['1', 'cons1'],
          updatable: true,
          args: [],
          expr: {
            constr: 'Cons',
            args: ['1', 'cons1'],
          },
        },
      },
      expr: {
        var: 'map',
        args: ['inc', 'cons2'],
      },
    },
  },
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
              mfys: {
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
              args: ['fy', 'mfys'],
            },
          },
        },
      ],
    },
  },
  inc: {
    free: [],
    updatable: false,
    args: ['n'],
    expr: {
      expr: {
        var: 'n',
        args: [],
      },
      alts: [
        {
          constr: 'Int#',
          vars: ['n#'],
          expr: {
            expr: {
              prim: '+#',
              args: ['n#', 1],
            },
            alts: [
              {
                var: 'm#',
                expr: {
                  constr: 'Int#',
                  args: ['m#'],
                },
              },
            ],
          },
        },
      ],
    },
  },
};

const program4: ast.Program = {
  main: {
    free: [],
    updatable: true,
    args: [],
    expr: {
      rec: false,
      binds: {
        ['10']: {
          free: [],
          updatable: true,
          args: [],
          expr: {
            constr: 'Int#',
            args: [10],
          },
        },
      },
      expr: {
        var: 'fact',
        args: ['10'],
      },
    },
  },
  ['*']: {
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
                    prim: '*#',
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
  ['-']: {
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
                    prim: '-#',
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
  fact: {
    free: [],
    updatable: false,
    args: ['n'],
    expr: {
      expr: {
        var: 'n',
        args: [],
      },
      alts: [
        {
          constr: 'Int#',
          vars: ['n#'],
          expr: {
            expr: {
              var: 'n#',
              args: [],
            },
            alts: [
              {
                literal: 0,
                expr: {
                  constr: 'Int#',
                  args: [1],
                },
              },
              {
                expr: {
                  rec: true,
                  binds: {
                    ['1']: {
                      free: [],
                      updatable: true,
                      args: [],
                      expr: {
                        constr: 'Int#',
                        args: [1],
                      },
                    },
                    m: {
                      free: ['n', '1'],
                      updatable: true,
                      args: [],
                      expr: {
                        var: '-',
                        args: ['n', '1'],
                      },
                    },
                    fm: {
                      free: ['m'],
                      updatable: true,
                      args: [],
                      expr: {
                        var: 'fact',
                        args: ['m'],
                      },
                    },
                  },
                  expr: {
                    var: '*',
                    args: ['n', 'fm'],
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
};

async function main(program: ast.Program) {
  console.log(prettyprint(program));

  const interpreter = createInterpreter(program);
  for (const state of interpreter) {
    console.dir(state, { depth: null });
  }
}

main(program2);
