import fs from 'fs';
import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';

const run = (program: ast.Program): void => {
  console.log(prettyprint(program));
  const interpreter = createInterpreter(program);
  try {
    for (const state of interpreter) {
      console.dir(state, { depth: null });
    }
  } catch (err: unknown) {
    console.error('Program exited with error: ', (err as Error).message);
    process.exit(1);
  }
};

const main = () => {
  if (process.argv.length < 3) {
    console.error('path to stg program not provided');
    process.exit(1);
  }

  const fname = process.argv[2];
  const data = fs.readFileSync(fname, 'utf-8');
  // expects valid input
  const program: ast.Program = JSON.parse(data);

  run(program);
};

main();
