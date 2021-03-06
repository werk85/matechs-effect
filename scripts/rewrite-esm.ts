import * as fs from "fs"

import chalk from "chalk"
import * as A from "fp-ts/lib/Array"
import { log } from "fp-ts/lib/Console"
import * as IO from "fp-ts/lib/IO"
import * as T from "fp-ts/lib/Task"
import * as TE from "fp-ts/lib/TaskEither"
import { Endomorphism } from "fp-ts/lib/function"
import { pipe } from "fp-ts/lib/pipeable"
import * as glob from "glob"

const ES6_GLOB_PATTERN = "build/esm/**/*.@(ts|js)"

const packages = [
  "fp-ts",
  "io-ts",
  "io-ts-types",
  "elm-ts",
  "fp-ts-contrib",
  "fp-ts-rxjs",
  "fp-ts-routing",
  "fp-ts-fluture",
  "parser-ts",
  "retry-ts",
  "hyper-ts",
  "fp—ts-local-storage",
  "@matechs/apollo",
  "@matechs/console",
  "@matechs/cqrs",
  "@matechs/cqrs-es",
  "@matechs/epics",
  "@matechs/express",
  "@matechs/koa",
  "@matechs/fancy",
  "@matechs/graceful",
  "@matechs/http-client",
  "@matechs/http-client-fetch",
  "@matechs/http-client-libcurl",
  "@matechs/logger",
  "@matechs/logger-winston",
  "@matechs/logger-pino",
  "@matechs/orm",
  "@matechs/rpc",
  "@matechs/rpc-client",
  "@matechs/rxjs",
  "@matechs/tracing",
  "@matechs/uuid",
  "@matechs/zoo",
  "@matechs/test",
  "@matechs/test-jest"
]

const regexp = new RegExp(
  `(\\s(?:from|module)\\s['|"](?:${packages.join("|")}))\\/lib\\/([\\w-\\/]+['|"])`,
  "gm"
)

export const replace: Endomorphism<string> = (s) => s.replace(regexp, "$1/es6/$2")

const readFile = TE.taskify<fs.PathLike, string, NodeJS.ErrnoException, string>(
  fs.readFile
)

const writeFile = TE.taskify<fs.PathLike, string, NodeJS.ErrnoException, void>(
  fs.writeFile
)

function modifyFile(
  f: Endomorphism<string>
): (path: string) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return (path) =>
    pipe(
      readFile(path, "utf8"),
      TE.map((original) => ({ original, updated: f(original) })),
      TE.chain(({ original, updated }) =>
        original === updated ? TE.of(undefined) : writeFile(path, updated)
      )
    )
}

function modifyFiles(
  f: Endomorphism<string>
): (paths: Array<string>) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return (paths) =>
    pipe(
      A.array.traverse(TE.taskEither)(paths, modifyFile(f)),
      TE.map(() => undefined)
    )
}

function modifyGlob(
  f: Endomorphism<string>
): (pattern: string) => TE.TaskEither<NodeJS.ErrnoException, void> {
  return (pattern) => pipe(glob.sync(pattern), TE.right, TE.chain(modifyFiles(f)))
}

const replaceFiles = modifyGlob(replace)(ES6_GLOB_PATTERN)

const exit = (code: 0 | 1): IO.IO<void> => () => process.exit(code)

function onLeft(e: NodeJS.ErrnoException): T.Task<void> {
  return T.fromIO(
    pipe(
      log(e),
      IO.chain(() => exit(1))
    )
  )
}

function onRight(): T.Task<void> {
  return T.fromIO(log(chalk.bold.green("import rewrite succeeded!")))
}

export const main = pipe(replaceFiles, TE.fold(onLeft, onRight))

main().catch((e) => console.log(chalk.bold.red(`Unexpected error: ${e}`)))
