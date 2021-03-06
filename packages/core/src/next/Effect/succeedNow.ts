import { Effect } from "./effect"
import { ISucceed } from "./primitives"

/**
 * Lift a pure value into an effect
 */
export const succeedNow = <A>(a: A): Effect<never, unknown, never, A> => new ISucceed(a)
