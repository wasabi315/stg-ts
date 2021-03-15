import * as pp from 'prettier-printer';
import * as ast from '~/ast';

export const prettyprint = (program: ast.Program): string => {
  return pp.render(0, ppBinds(program));
};

const TAB_SIZE = 4;

const ppBinds = (binds: ast.Binds): pp.IDoc => {
  return pp.intersperse(
    pp.prepend(pp.line, pp.line),
    [...Object.entries(binds)].map((bind) => ppBind(...bind))
  );
};

const ppBind = (v: ast.Var, lf: ast.LambdaForm): pp.IDoc => {
  return pp.intersperse(' ', [v, '=', ppLambdaForm(lf)]);
};

const ppLambdaForm = (lf: ast.LambdaForm): pp.IDoc => {
  return pp.intersperse(pp.line, [
    pp.intersperse(' ', [
      ppVars(lf.free),
      lf.updatable ? '\\u' : '\\n',
      ppVars(lf.args),
      '->',
    ]),
    pp.indent(TAB_SIZE, ppExpr(lf.expr)),
  ]);
};

const ppExpr = (expr: ast.Expr): pp.IDoc => {
  if (ast.isLet(expr)) {
    return pp.intersperse(pp.line, [
      expr.rec ? 'letrec' : 'let',
      pp.indent(TAB_SIZE, ppBinds(expr.binds)),
      'in',
      pp.indent(TAB_SIZE, ppExpr(expr.expr)),
    ]);
  }

  if (ast.isCase(expr)) {
    return pp.intersperse(pp.line, [
      pp.intersperse(' ', ['case', ppExpr(expr.expr), 'of']),
      pp.indent(TAB_SIZE, ppAlts(expr.alts)),
    ]);
  }

  if (ast.isVarApp(expr)) {
    return pp.intersperse(' ', [expr.var, ppAtoms(expr.args)]);
  }

  if (ast.isConstrApp(expr)) {
    return pp.intersperse(' ', [expr.constr, ppAtoms(expr.args)]);
  }

  if (ast.isPrimApp(expr)) {
    return pp.intersperse(' ', [expr.prim, ppAtoms(expr.args)]);
  }

  if (ast.isLiteral(expr)) {
    return ppLiteral(expr);
  }

  throw new Error('unreachable');
};

const ppAlts = (alts: ast.Alt[]): pp.IDoc => {
  return pp.intersperse(pp.prepend(pp.line, pp.line), alts.map(ppAlt));
};

const ppAlt = (alt: ast.Alt): pp.IDoc => {
  let pattern: pp.IDoc;

  if (ast.isAlgAlt(alt)) {
    pattern = pp.intersperse(' ', [alt.constr, ppVars(alt.vars)]);
  } else if (ast.isPrimAlt(alt)) {
    pattern = ppLiteral(alt.literal);
  } else if (ast.isVarAlt(alt)) {
    pattern = alt.var;
  } else {
    pattern = 'default';
  }

  return pp.intersperse(pp.line, [
    pp.intersperse(' ', [pattern, '->']),
    pp.indent(TAB_SIZE, ppExpr(alt.expr)),
  ]);
};

const ppVars = (vs: ast.Var[]): pp.IDoc => {
  return pp.enclose(pp.braces, pp.intersperse(',', vs));
};

const ppAtoms = (atoms: ast.Atom[]): pp.IDoc => {
  return pp.enclose(
    pp.braces,
    pp.intersperse(
      ',',
      atoms.map((atom) => {
        return ast.isLiteral(atom) ? ppLiteral(atom) : atom;
      })
    )
  );
};

const ppLiteral = (literal: ast.Literal): pp.IDoc => {
  return String(literal);
};
