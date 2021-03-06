import { uninterruptible as statusUninterruptible } from "../Fiber/interruptStatus"

import { interruptStatus } from "./interruptStatus"

/**
 * Performs this effect uninterruptibly. This will prevent the effect from
 * being terminated externally, but the effect may fail for internal reasons
 * (e.g. an uncaught error) or terminate due to defect.
 *
 * Uninterruptible effects may recover from all failure causes (including
 * interruption of an inner effect that has been made interruptible).
 */
export const uninterruptible =
  /*#__PURE__*/
  interruptStatus(statusUninterruptible)
