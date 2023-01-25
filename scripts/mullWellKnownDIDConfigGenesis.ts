// generate a well known did configuration credential

import {
    Did,
    CType,
    Credential,
    Claim,
    SignCallback,
    DidUri,
    Utils,
    ICredentialPresentation,
    DidResourceUri,
    connect,
    KiltKeyringPair,
    DidDocument,
    KiltEncryptionKeypair,
    KeyringPair,
    Blockchain
} from '@kiltprotocol/sdk-js';
import { Keyring } from '@kiltprotocol/utils';
import {
    CredentialSubject,
    DomainLinkageCredential,
    VerifiableDomainLinkagePresentation,
} from '../frontend/src/utils/types';
import * as validUrl from 'valid-url';

import { SelfSignedProof } from '@kiltprotocol/vc-export';
import { hexToU8a } from '@polkadot/util';

import {
    createCredential,
    DID_CONFIGURATION_CONTEXT,
    getDomainLinkagePresentation,
    verifyDidConfigPresentation,
    DID_VC_CONTEXT,
    DEFAULT_VERIFIABLECREDENTIAL_TYPE,
    KILT_VERIFIABLECREDENTIAL_TYPE,
} from './wellKnownDidConfiguration';

import {
    naclBoxPairFromSecret,
    blake2AsU8a,
    keyFromPath,
    sr25519PairFromSeed,
    keyExtractPath,
    mnemonicToMiniSecret,
    cryptoWaitReady,
} from '@polkadot/util-crypto';

//Andres:
//Try to create the well-know Did Config


const domainURI = process.env.ATTESTER_DID as DidUri || `did:kilt:4${'noURIEstablished'}` as DidUri;
const domainOrigin = process.env.ORIGIN || 'no origin assiged';

const domainDIDmnemonic = process.env.ATTESTER_MNEMONIC || 'club urge scorpion wrong staff ostrich cram cinnamon dose peanut student loud';
const domainAccount = new Keyring({ type: 'sr25519' }).addFromMnemonic(domainDIDmnemonic) as KiltKeyringPair;
const keypair = await keypairs(domainAccount, domainDIDmnemonic);

const myDidDocument = await generateDid(domainAccount, domainDIDmnemonic);

// @ts-ignore
const myKey = myDidDocument.assertionMethod[0];

console.log(myKey);

const myDomainsCredential = await createCredential(
    await assertionSigner({ assertion: keypair.assertion, didDocument: myDidDocument }),
    domainOrigin,
    domainURI
);

const myDomainLinkagePresentation = await getDomainLinkagePresentation(myDomainsCredential);

console.log(myDomainLinkagePresentation);


async function keypairs(account: KiltKeyringPair, mnemonic: string) {
    const authentication = {
        ...account.derive('//did//0'),
        type: 'sr25519',
    } as KiltKeyringPair;
    const assertion = {
        ...account.derive('//did//assertion//0'),
        type: 'sr25519',
    } as KiltKeyringPair;
    const keyAgreement: KiltEncryptionKeypair = (function () {
        const secretKeyPair = sr25519PairFromSeed(mnemonicToMiniSecret(mnemonic));
        const { path } = keyExtractPath('//did//keyAgreement//0');
        const { secretKey } = keyFromPath(secretKeyPair, path, 'sr25519');
        return {
            ...naclBoxPairFromSecret(blake2AsU8a(secretKey)),
            type: 'x25519',
        };
    })();

    return {
        authentication,
        assertion,
        keyAgreement,
    };
}

async function generateDid(
    account: KiltKeyringPair,
    mnemonic: string
): Promise<DidDocument> {
    const { authentication, assertion, keyAgreement } = await keypairs(
        account,
        mnemonic
    );

    const uri = Did.getFullDidUriFromKey(authentication);
    let fullDid = await Did.resolve(uri);
    if (fullDid?.document) return fullDid.document;

    const extrinsic = await Did.getStoreTx(
        {
            authentication: [authentication],
            assertionMethod: [assertion],
            keyAgreement: [keyAgreement],
        },
        account.address,
        async ({ data }) => ({
            signature: authentication.sign(data),
            keyType: authentication.type,
        })
    );

    await Blockchain.signAndSubmitTx(extrinsic, account, {
        resolveOn: Blockchain.IS_FINALIZED,
    });

    fullDid = await Did.resolve(uri);
    if (!fullDid || !fullDid.document)
        throw new Error('Could not fetch created DID document');
    return fullDid.document;
}

async function assertionSigner({
    assertion,
    didDocument,
}: {
    assertion: KiltKeyringPair;
    didDocument: DidDocument;
}): Promise<SignCallback> {
    const { assertionMethod } = didDocument;
    if (!assertionMethod) throw new Error('no assertionMethod');
    return async ({ data }) => ({
        signature: assertion.sign(data),
        keyType: 'sr25519',
        keyUri: `${didDocument.uri}${assertionMethod[0].id}`,
    });
}