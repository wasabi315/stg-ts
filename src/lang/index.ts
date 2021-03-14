export type Program = Binds;

export type Binds = Map<Var, LambdaForm>;

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

export type Var = string;
export type Constr = string;
export type Prim = string;
export type Literal = number;
export type Atom = Var | Literal;
