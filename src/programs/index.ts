import * as ast from '~/ast';

export const Int = (atom: ast.Atom): ast.Expr => ({
  constr: 'Int#',
  args: [atom],
});

const mkArithOp = (opname: ast.Var, primop: ast.Prim): ast.Program => ({
  [opname]: {
    free: [],
    updatable: false,
    args: ['x', 'y'],
    expr: {
      expr: { var: 'x', args: [] },
      alts: [
        {
          constr: 'Int#',
          vars: ['x#'],
          expr: {
            expr: { var: 'y', args: [] },
            alts: [
              {
                constr: 'Int#',
                vars: ['y#'],
                expr: {
                  expr: { prim: primop, args: ['x#', 'y#'] },
                  alts: [
                    {
                      var: 'z#',
                      expr: Int('z#'),
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
});

export const add = mkArithOp('add', '+#');
export const sub = mkArithOp('sub', '-#');
export const mul = mkArithOp('mul', '*#');
export const div = mkArithOp('div', '/#');

export const id: ast.Program = {
  id: {
    free: [],
    updatable: false,
    args: ['x'],
    expr: {
      var: 'x',
      args: [],
    },
  },
};

export const const_: ast.Program = {
  const: {
    free: [],
    updatable: false,
    args: ['x', 'y'],
    expr: {
      var: 'x',
      args: [],
    },
  },
};

export const undefined_: ast.Program = {
  undefined: {
    free: [],
    updatable: true,
    args: [],
    expr: {
      var: 'undefined',
      args: [],
    },
  },
};

export const fix: ast.Program = {
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

export const compose: ast.Program = {
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

export const traceInt: ast.Program = {
  traceInt: {
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
            prim: 'traceLit#',
            args: ['n#'],
          },
        },
      ],
    },
  },
};
