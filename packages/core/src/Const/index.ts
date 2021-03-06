/* adapted from https://github.com/gcanti/fp-ts */

/**
 * The `Const` type constructor, which wraps its first type argument and ignores its second.
 * That is, `Const<E, A>` is isomorphic to `E` for any `A`.
 *
 * `Const` has some useful instances. For example, the `Applicative` instance allows us to collect results using a `Monoid`
 * while ignoring return values.
 */

import type {
  CApplicative2C,
  CApply2C,
  CBifunctor2,
  CContravariant2,
  CFunctor2,
  Functor2,
  Contravariant2,
  Bifunctor2
} from "../Base"
import type { Eq } from "../Eq"
import { identity, unsafeCoerce } from "../Function"
import type { Monoid } from "../Monoid"
import type { Bounded, Ord } from "../Ord"
import type { Semigroup } from "../Semigroup"
import type { Show } from "../Show"

export type Const<E, A> = E & {
  readonly _A: A
}

export const bimap_: <E, A, G, B>(
  fea: Const<E, A>,
  f: (e: E) => G,
  g: (a: A) => B
) => Const<G, B> = (fea, f) => make(f(fea))

export const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => (fa: Const<E, A>) => Const<G, B> = (f, g) => (fa) => bimap_(fa, f, g)

export const contramap_: <E, A, B>(
  fa: Const<E, A>,
  f: (b: B) => A
) => Const<E, B> = unsafeCoerce

export const contramap: <A, B>(
  f: (b: B) => A
) => <E>(fa: Const<E, A>) => Const<E, B> = (f) => (fa) => contramap_(fa, f)

export function getApplicative<E>(M: Monoid<E>): CApplicative2C<URI, E> {
  return {
    ...getApply(M),
    of: () => make(M.empty)
  }
}

export function getApply<E>(S: Semigroup<E>): CApply2C<URI, E> {
  return {
    URI,
    _E: undefined as any,
    map,
    ap: (fa) => (fab) => make(S.concat(fab, fa))
  }
}

export const getBounded: <E, A>(B: Bounded<E>) => Bounded<Const<E, A>> = identity as any

export const getEq: <E, A>(E: Eq<E>) => Eq<Const<E, A>> = identity

export const getMonoid: <E, A>(M: Monoid<E>) => Monoid<Const<E, A>> = identity as any

export const getOrd: <E, A>(O: Ord<E>) => Ord<Const<E, A>> = identity

export const getSemigroup: <E, A>(
  S: Semigroup<E>
) => Semigroup<Const<E, A>> = identity as any

export function getShow<E, A>(S: Show<E>): Show<Const<E, A>> {
  return {
    show: (c) => `make(${S.show(c)})`
  }
}

export const make: <E, A = never>(e: E) => Const<E, A> = unsafeCoerce

export const map_: <E, A, B>(
  fa: Const<E, A>,
  f: (a: A) => B
) => Const<E, B> = unsafeCoerce

export const map: <A, B>(f: (a: A) => B) => <E>(fa: Const<E, A>) => Const<E, B> = (
  f
) => (fa) => map_(fa, f)

export const mapLeft_: <E, A, G>(fea: Const<E, A>, f: (e: E) => G) => Const<G, A> = (
  fea,
  f
) => make(f(fea))

export const mapLeft: <E, G>(f: (e: E) => G) => <A>(fa: Const<E, A>) => Const<G, A> = (
  f
) => (fa) => mapLeft_(fa, f)

export const URI = "@matechs/core/Const"

export type URI = typeof URI

declare module "../Base/HKT" {
  interface URItoKind2<E, A> {
    readonly [URI]: Const<E, A>
  }
}

const const_: CFunctor2<URI> & CContravariant2<URI> & CBifunctor2<URI> = {
  URI,
  map,
  contramap,
  bimap,
  mapLeft
}

export { const_ as const }

//
// Compatibility with fp-ts ecosystem
//

const const__: Functor2<URI> & Contravariant2<URI> & Bifunctor2<URI> = {
  URI,
  map: map_,
  contramap: contramap_,
  bimap: bimap_,
  mapLeft: mapLeft_
}

export { const__ as const_ }
