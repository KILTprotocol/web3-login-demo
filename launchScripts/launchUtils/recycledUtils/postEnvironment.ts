/**
 * Most of the utilities needed during the set-up that are also needed by the backend.
 * It is important that this utilities correlate so that the backend can use what was configured during set-up (launch).
 * To avoid duplicated code and discrepancies, it is better to import from the backend the utilities needed for the set-up.
 * That is what is done here on the 'recycledUtils' folder.
 */

//
// Import and Export Functions:
//

// This two functions from the Backend use the backend-config directly or indirectly.
// The config from the backend try to loads all the env-constants and throws if one is missing.
// That's why they are imported in a separated file.
// This file should only be loaded after all environment constants are defined; e.g. while generating the Domain-Linkage-Credential, but not the Environment Variables.

import { fetchDidDocument } from '../../../backend/src/utils/fetchDidDocument'
import { validateOurKeys } from '../../../backend/src/config'

export { validateOurKeys, fetchDidDocument }
