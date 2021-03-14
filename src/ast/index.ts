export type Program = Binds;

export type Binds = Record<Var, LambdaForm>;

export type LambdaForm = {
  free: Var[];
  updatable: boolean;
  args: Var[];
  body: Expr;
};

export type Expr = Let | Case | VarApp | ConstrApp | PrimApp | Literal;

export type Let = {
  rec: boolean;
  binds: Binds;
  expr: Expr;
};

export type Case = {
  expr: Expr;
  alts: Alt[];
};

export type VarApp = {
  var: Var;
  args: Atom[];
};

export type ConstrApp = {
  constr: Constr;
  args: Atom[];
};

export type PrimApp = {
  prim: Prim;
  args: Atom[];
};

export type Alt = AlgAlt | PrimAlt | VarAlt | DefAlt;

export type AlgAlt = {
  constr: Constr;
  vars: Var[];
  expr: Expr;
};

export type PrimAlt = {
  literal: Literal;
  expr: Expr;
};

export type VarAlt = {
  var: Var;
  expr: Expr;
};

export type DefAlt = {
  expr: Expr;
};

export type Var = string;
export type Constr = string;
export type Prim = string;
export type Literal = number;
export type Atom = Var | Literal;

export const isLet = (expr: Expr): expr is Let => {
  return !isLiteral(expr) && 'rec' in expr;
};

export const isCase = (expr: Expr): expr is Case => {
  return !isLiteral(expr) && 'alts' in expr;
};

export const isVarApp = (expr: Expr): expr is VarApp => {
  return !isLiteral(expr) && 'var' in expr;
};

export const isConstrApp = (expr: Expr): expr is ConstrApp => {
  return !isLiteral(expr) && 'constr' in expr;
};

export const isPrimApp = (expr: Expr): expr is PrimApp => {
  return !isLiteral(expr) && 'prim' in expr;
};

export const isAlgAlt = (alt: Alt): alt is AlgAlt => {
  return 'constr' in alt;
};

export const isPrimAlt = (alt: Alt): alt is PrimAlt => {
  return 'literal' in alt;
};

export const isVarAlt = (alt: Alt): alt is VarAlt => {
  return 'var' in alt;
};

export const isDefAlt = (alt: Alt): alt is DefAlt => {
  return !isAlgAlt(alt) && !isPrimAlt(alt) && !isVarAlt(alt);
};

export const isVar = (atom: Atom): atom is Var => {
  return typeof atom === 'string';
};

export const isLiteral: {
  (expr: Expr): expr is Literal;
  (atom: Atom): atom is Literal;
} = (x: unknown): x is Literal => {
  return typeof x === 'number';
};
