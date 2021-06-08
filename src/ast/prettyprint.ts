import * as pp from 'prettier-printer';
import * as ast from '~/ast';

export const prettyprint = (program: ast.Program): string => {
  return pp.render(0, ppBinds(program));
};

const TAB_SIZE = 4;

const ppBinds = (binds: ast.Binds): pp.IDoc => {
  return ppUnlines2(
    ...[...Object.entries(binds)].map((bind) => ppBind(...bind))
  );
};

const ppBind = (v: ast.Var, lf: ast.LambdaForm): pp.IDoc => {
  return ppUnwords(v, '=', ppLambdaForm(lf));
};

const ppLambdaForm = (lf: ast.LambdaForm): pp.IDoc => {
  return ppUnlines(
    ppUnwords(
      ppVars(lf.free),
      lf.updatable ? '\\u' : '\\n',
      ppVars(lf.args),
      '->'
    ),
    pp.indent(TAB_SIZE, ppExpr(lf.expr))
  );
};

const ppExpr = (expr: ast.Expr): pp.IDoc => {
  if (ast.isLet(expr)) {
    return ppUnlines(
      expr.rec ? 'letrec' : 'let',
      pp.indent(TAB_SIZE, ppBinds(expr.binds)),
      'in',
      pp.indent(TAB_SIZE, ppExpr(expr.expr))
    );
  }

  if (ast.isCase(expr)) {
    return ppUnlines(
      ppUnwords('case', ppExpr(expr.expr), 'of'),
      pp.indent(TAB_SIZE, ppAlts(expr.alts))
    );
  }

  if (ast.isVarApp(expr)) {
    return ppUnwords(expr.var, ppAtoms(expr.args));
  }

  if (ast.isConstrApp(expr)) {
    return ppUnwords(expr.constr, ppAtoms(expr.args));
  }

  if (ast.isPrimApp(expr)) {
    return ppUnwords(expr.prim, ppAtoms(expr.args));
  }

  if (ast.isLiteral(expr)) {
    return ppLiteral(expr);
  }

  throw new Error('unreachable');
};

const ppAlts = (alts: ast.Alt[]): pp.IDoc => {
  return ppUnlines2(...alts.map(ppAlt));
};

const ppAlt = (alt: ast.Alt): pp.IDoc => {
  let pattern: pp.IDoc;

  if (ast.isAlgAlt(alt)) {
    pattern = ppUnwords(alt.constr, ppVars(alt.vars));
  } else if (ast.isPrimAlt(alt)) {
    pattern = ppLiteral(alt.literal);
  } else if (ast.isVarAlt(alt)) {
    pattern = alt.var;
  } else {
    pattern = 'default';
  }

  return ppUnlines(
    ppUnwords(pattern, '->'),
    pp.indent(TAB_SIZE, ppExpr(alt.expr))
  );
};

const ppVars = (vs: ast.Var[]): pp.IDoc => {
  return ppBraces(ppSepByComma(...vs));
};

const ppAtoms = (atoms: ast.Atom[]): pp.IDoc => {
  return ppBraces(
    ppSepByComma(
      atoms.map((atom) => {
        return ast.isLiteral(atom) ? ppLiteral(atom) : atom;
      })
    )
  );
};

const ppLiteral = (literal: ast.Literal): pp.IDoc => {
  return `${literal}#`;
};

// Utils
const ppUnwords = (...docs: pp.IDoc[]): pp.IDoc => {
  return pp.intersperse(' ', docs);
};

const ppUnlines = (...docs: pp.IDoc[]): pp.IDoc => {
  return pp.intersperse(pp.line, docs);
};

const ppUnlines2 = (...docs: pp.IDoc[]): pp.IDoc => {
  return pp.intersperse(pp.prepend(pp.line, pp.line), docs);
};

const ppSepByComma = (...docs: pp.IDoc[]): pp.IDoc => {
  return pp.intersperse(',', docs);
};

const ppBraces = (doc: pp.IDoc): pp.IDoc => {
  return pp.enclose(pp.braces, doc);
};
