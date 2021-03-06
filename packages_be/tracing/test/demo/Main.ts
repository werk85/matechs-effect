import { withControllerSpan, withTracer, Tracer } from "../../src"

import * as C from "./Counter"
import * as P from "./Printer"

import * as T from "@matechs/core/Effect"
import { pipe } from "@matechs/core/Function"

export const program = withTracer(
  withControllerSpan(
    "demo",
    "demo-main"
  )(
    pipe(
      T.Do()
        .bind("start", C.currentCount())
        .do(C.count())
        .do(C.count())
        .bind("end", C.currentCount())
        .doL(({ end, start }) => P.print(`done - ${start} <-> ${end}`))
        .done(),
      C.counterState
    )
  )
)

export const main = pipe(program, P.Printer.with(C.Counter).with(Tracer()).use)
