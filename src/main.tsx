import React from 'react';
import { render, Text, Box } from 'ink';
import * as ast from '~/ast';
import { prettyprint } from '~/ast/prettyprint';
import { createInterpreter } from '~/interpreter';
import { Int, traceInt, fact } from '~/programs';

const captureStdout = (fn: () => unknown): string => {
  const origWrite = process.stdout.write.bind(process.stdout);

  let out = '';
  process.stdout.write = ((chunk: string | Uint8Array) => {
    if (typeof chunk === 'string') {
      out += chunk;
    }
  }) as typeof origWrite;
  fn();
  process.stdout.write = origWrite;

  return out;
};

const run = (program: ast.Program): void => {
  // Run interpreter
  const interpreter = createInterpreter(program);
  let out: string;
  try {
    out = captureStdout(() => {
      for (const _ of interpreter);
    });
  } catch (err) {
    out = `Program exited with error: ${
      err instanceof Error ? err.message : err
    }`;
  }

  render(
    <Box flexDirection="column" marginBottom={1}>
      <Box flexGrow={1} borderStyle="round" paddingX={2}>
        <Text>{prettyprint(program)}</Text>
      </Box>
      <Box flexGrow={1} borderStyle="round" paddingX={2}>
        <Text>{out.trim()}</Text>
      </Box>
    </Box>
  );
};

const main = () => {
  const program: ast.Program = {
    main: {
      free: [],
      updatable: true,
      args: [],
      expr: {
        rec: true,
        binds: {
          ['20']: {
            free: [],
            updatable: true,
            args: [],
            expr: Int(20),
          },
          res: {
            free: ['20'],
            updatable: true,
            args: [],
            expr: {
              var: 'fact',
              args: ['20'],
            },
          },
        },
        expr: {
          var: 'traceInt',
          args: ['res'],
        },
      },
    },
    ...fact,
    ...traceInt,
  };

  run(program);
};

main();
