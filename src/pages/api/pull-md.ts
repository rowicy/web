import type { APIRoute } from 'astro';
import { exec } from 'node:child_process';

export const POST: APIRoute = async () => {
  return new Promise((resolve) => {
    exec('pnpm pull-md --pull-all; pnpm normalize-md', (error, stdout, stderr) => {
      if (error) {
        resolve(
          new Response(
            JSON.stringify({ message: stderr }),
            { status: 500 }
          )
        );
        return;
      }

      resolve(
        new Response(
          JSON.stringify({ message: stdout }),
          { status: 200 }
        )
      );
    });
  });
};
