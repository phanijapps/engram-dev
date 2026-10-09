/** Compile-time exhaustiveness: a switch that misses a member fails the build. */
export function assertNever(x: never): never {
  throw new Error(`unhandled member: ${JSON.stringify(x)}`);
}
