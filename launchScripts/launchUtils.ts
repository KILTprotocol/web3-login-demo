/**
 * There are some utilities needed during the set-up that are also needed by the backend.
 * It is important that this utilities correlate so that the backend can use what was configured during set-up (launch).
 * To avoid duplicated code and discrepancies, it is better to import from the backend the utilities needed for the set-up.
 * That is what is done here.
 */

import { validateOurKeys } from '../backend/src/config'
import { fetchDidDocument } from '../backend/src/utils/fetchDidDocument'

export { validateOurKeys, fetchDidDocument }
