import crypto from 'crypto';
import * as ast from '~/ast';

export function* createInterpreter(program: ast.Program): Generator<State> {
  let state = createInitialState(program);

  for (;;) {
    yield state;

    const nextState = transition(state);
    if (nextState === null) {
      return;
    }
    state = nextState;
  }
}

const createInitialState = (program: ast.Program): State => {
  const globals: Env = {};

  [...Object.entries(program)].forEach(([v, lf]) => {
    globals[v] = { lf, free: [], updating: false };
  });
  [...Object.entries(program)].forEach(([v, lf]) => {
    (globals[v] as Addr).free.push(...vals({}, globals, lf.free));
  });

  return {
    code: { expr: { var: 'main', args: [] }, locals: {} },
    args: [],
    returns: [],
    updates: [],
    globals,
  };
};

export type State = {
  code: Code;
  args: ArgStack;
  returns: ReturnStack;
  updates: UpdateStack;
  globals: Env;
};

type Eval = {
  expr: ast.Expr;
  locals: Env;
};

type Enter = {
  addr: Addr;
};

type ReturnCon = {
  constr: ast.Constr;
  args: Value[];
};

type ReturnInt = {
  int: Int;
};

type Code = Eval | Enter | ReturnCon | ReturnInt;

type Env = Record<ast.Var, Value>;

type ArgStack = Value[];

type Continuation = {
  env: Env;
  alts: ast.Alt[];
};

type ReturnStack = Continuation[];

type UpdateFrame = {
  args: ArgStack;
  returns: ReturnStack;
  addr: Addr;
};

type UpdateStack = UpdateFrame[];

type Closure = {
  lf: ast.LambdaForm;
  free: Value[];
  updating: boolean;
};

type Addr = Closure;
type Int = number;
type Value = Addr | Int;

const isEval = (code: Code): code is Eval => {
  return 'expr' in code;
};

const isEnter = (code: Code): code is Enter => {
  return 'addr' in code;
};

const isReturnCon = (code: Code): code is ReturnCon => {
  return 'constr' in code;
};

const isReturnInt = (code: Code): code is ReturnInt => {
  return 'int' in code;
};

const isInt = (value: Value): value is Int => {
  return typeof value === 'number';
};

const isAddr = (value: Value): value is Addr => {
  return !isInt(value);
};

const val = (local: Env, global: Env, atom: ast.Atom): Value => {
  if (ast.isLiteral(atom)) {
    return atom;
  }

  const addr = local[atom] ?? global[atom];

  if (addr === undefined) {
    throw new Error(`unknown variable ${atom}`);
  }

  return addr;
};

const vals = (local: Env, global: Env, atoms: ast.Atom[]): Value[] => {
  return atoms.map((atom) => val(local, global, atom));
};

const genFreshVar = (): string => {
  return `fresh_${crypto.randomBytes(4).toString('hex')}`;
};

const splitAt = <T>(ix: number, arr: T[]): [T[], T[]] => {
  return [arr.slice(0, ix), arr.slice(ix)];
};

type Rule = (state: State) => State | null;

const transition = (state: State): State | null => {
  const rules = [
    evalVarApp,
    enterNonUpdatable,
    evalLet,
    evalCase,
    evalConstrApp,
    returnConMatched,
    returnConDefault,
    returnConDefaultWithBind,
    evalLiteral,
    evalVarOfLiteral,
    returnIntMatched,
    returnIntDefault,
    returnIntDefaultWithBind,
    evalPrimApp,
    enterUpdatable,
    returnConRestore,
    enterParApp,
  ];

  for (const rule of rules) {
    const nextState = rule(state);

    if (nextState !== null) {
      return nextState;
    }
  }

  return null;
};

const evalVarApp: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isVarApp(code.expr)) {
    return null;
  }

  const v = val(code.locals, globals, code.expr.var);
  if (!isAddr(v)) {
    return null;
  }

  return {
    code: { addr: v },
    args: [...vals(code.locals, globals, code.expr.args), ...args],
    returns,
    updates,
    globals,
  };
};

const enterNonUpdatable: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEnter(code)) {
    return null;
  }

  const closure = code.addr;
  if (closure.lf.updatable || args.length < closure.lf.args.length) {
    return null;
  }

  const [closureArgs, nextArgs] = splitAt(closure.lf.args.length, args);

  const locals: Env = {};
  closure.lf.args.forEach((v, i) => {
    locals[v] = closureArgs[i];
  });
  closure.lf.free.forEach((v, i) => {
    locals[v] = closure.free[i];
  });

  return {
    code: { expr: closure.lf.expr, locals },
    args: nextArgs,
    returns,
    updates,
    globals,
  };
};

const evalLet: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isLet(code.expr)) {
    return null;
  }

  const locals = { ...code.locals };
  [...Object.entries(code.expr.binds)].forEach(([v, lf]) => {
    locals[v] = { lf, free: [], updating: false };
  });
  const localsRhs = code.expr.rec ? locals : code.locals;
  [...Object.entries(code.expr.binds)].forEach(([v, lf]) => {
    (locals[v] as Addr).free.push(...vals(localsRhs, {}, lf.free));
  });

  return {
    code: { expr: code.expr.expr, locals },
    args,
    returns,
    updates,
    globals,
  };
};

const evalCase: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isCase(code.expr)) {
    return null;
  }

  return {
    code: { expr: code.expr.expr, locals: code.locals },
    args,
    returns: [{ alts: code.expr.alts, env: code.locals }, ...returns],
    updates,
    globals,
  };
};

const evalConstrApp: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isConstrApp(code.expr)) {
    return null;
  }

  return {
    code: {
      constr: code.expr.constr,
      args: vals(code.locals, globals, code.expr.args),
    },
    args,
    returns,
    updates,
    globals,
  };
};

const takenAlt: {
  (alts: ast.Alt[], constr: ast.Constr): ast.Alt | undefined;
  (alts: ast.Alt[], literal: ast.Literal): ast.Alt | undefined;
} = (alts: ast.Alt[], x: string | number): ast.Alt | undefined => {
  const taken = (alt: ast.Alt): boolean => {
    return (
      (typeof x === 'string'
        ? ast.isAlgAlt(alt) && alt.constr === x
        : ast.isPrimAlt(alt) && alt.literal === x) ||
      ast.isDefAlt(alt) ||
      ast.isVarAlt(alt)
    );
  };

  return alts.find(taken);
};

const returnConMatched: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isReturnCon(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.constr);
  if (alt === undefined || !ast.isAlgAlt(alt)) {
    return null;
  }

  const locals = { ...rframe.env };
  alt.vars.forEach((v, i) => {
    locals[v] = code.args[i];
  });

  return {
    code: { expr: alt.expr, locals },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const returnConDefault: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isReturnCon(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.constr);
  if (alt === undefined || !ast.isDefAlt(alt)) {
    return null;
  }

  return {
    code: { expr: alt.expr, locals: rframe.env },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const returnConDefaultWithBind: Rule = ({
  code,
  args,
  returns,
  updates,
  globals,
}) => {
  if (!isReturnCon(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.constr);
  if (alt === undefined || !ast.isVarAlt(alt)) {
    return null;
  }

  const free = Array.from({ length: code.args.length }, genFreshVar);
  const closure: Closure = {
    lf: {
      free,
      updatable: false,
      args: [],
      expr: {
        constr: code.constr,
        args: free,
      },
    },
    free: code.args,
    updating: false,
  };

  const locals = { ...rframe.env, [alt.var]: closure };

  return {
    code: { expr: alt.expr, locals },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const evalLiteral: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isLiteral(code.expr)) {
    return null;
  }

  return {
    code: { int: code.expr },
    args,
    returns,
    updates,
    globals,
  };
};

const evalVarOfLiteral: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isVarApp(code.expr)) {
    return null;
  }

  const v = val(code.locals, globals, code.expr.var);
  if (!isInt(v) || code.expr.args.length !== 0) {
    return null;
  }

  return {
    code: { int: v },
    args,
    returns,
    updates,
    globals,
  };
};

const returnIntMatched: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isReturnInt(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.int);
  if (alt === undefined || !ast.isPrimAlt(alt)) {
    return null;
  }

  return {
    code: { expr: alt.expr, locals: rframe.env },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const returnIntDefault: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isReturnInt(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.int);
  if (alt === undefined || !ast.isDefAlt(alt)) {
    return null;
  }

  return {
    code: { expr: alt.expr, locals: rframe.env },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const returnIntDefaultWithBind: Rule = ({
  code,
  args,
  returns,
  updates,
  globals,
}) => {
  if (!isReturnInt(code) || returns.length === 0) {
    return null;
  }

  const [rframe, ...nextReturns] = returns;

  const alt = takenAlt(rframe.alts, code.int);
  if (alt === undefined || !ast.isVarAlt(alt)) {
    return null;
  }

  const locals = { ...rframe.env, [alt.var]: code.int };

  return {
    code: { expr: alt.expr, locals },
    args,
    returns: nextReturns,
    updates,
    globals,
  };
};

const evalPrimApp: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEval(code) || !ast.isPrimApp(code.expr)) {
    return null;
  }

  const ns = vals(code.locals, {}, code.expr.args);
  if (!ns.every(isInt)) {
    return null;
  }

  let n: Int;
  switch (code.expr.prim) {
    case '+#':
      n = ns[0] + ns[1];
      break;
    case '-#':
      n = ns[0] - ns[1];
      break;
    case '*#':
      n = ns[0] * ns[1];
      break;
    case '/#':
      n = ns[0] / ns[1];
      break;
    case 'traceLit#':
      n = ns[0];
      console.log(n);
      break;
    default:
      throw new Error(`Unknown primitive ${code.expr.prim}`);
  }

  return {
    code: { int: n },
    args,
    returns,
    updates,
    globals,
  };
};

const enterUpdatable: Rule = ({ code, args, returns, updates, globals }) => {
  if (!isEnter(code) || !code.addr.lf.updatable) {
    return null;
  }

  if (code.addr.updating) {
    throw Error('<<loop>>');
  }

  const locals: Env = {};
  code.addr.lf.free.forEach((v, i) => {
    locals[v] = code.addr.free[i];
  });
  code.addr.updating = true;

  return {
    code: { expr: code.addr.lf.expr, locals },
    args: [],
    returns: [],
    updates: [{ args, returns, addr: code.addr }, ...updates],
    globals,
  };
};

const returnConRestore: Rule = ({ code, args, returns, updates, globals }) => {
  if (
    !isReturnCon(code) ||
    args.length !== 0 ||
    returns.length !== 0 ||
    updates.length === 0
  ) {
    return null;
  }

  const [uframe, ...nextUpdates] = updates;

  const free = Array.from({ length: code.args.length }, genFreshVar);
  uframe.addr.lf = {
    free,
    updatable: false,
    args: [],
    expr: {
      constr: code.constr,
      args: free,
    },
  };
  uframe.addr.free = code.args;
  uframe.addr.updating = false;

  return {
    code,
    args: uframe.args,
    returns: uframe.returns,
    updates: nextUpdates,
    globals,
  };
};

const enterParApp: Rule = ({ code, args, updates, globals }) => {
  if (!isEnter(code) || updates.length === 0) {
    return null;
  }

  const closure = code.addr;
  if (closure.lf.updatable || args.length >= closure.lf.args.length) {
    return null;
  }

  const [uframe, ...nextUpdates] = updates;

  const args1 = closure.lf.args.slice(0, args.length);
  const args2 = closure.lf.args.slice(args.length);

  uframe.addr.lf = {
    free: [...closure.lf.free, ...args1],
    updatable: false,
    args: args2,
    expr: closure.lf.expr,
  };
  uframe.addr.free = [...closure.free, ...args];

  return {
    code: { addr: closure },
    args: [...args, ...uframe.args],
    returns: uframe.returns,
    updates: nextUpdates,
    globals,
  };
};
