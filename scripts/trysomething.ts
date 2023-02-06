import * as Kilt from '@kiltprotocol/sdk-js';

export const ctypeDomainLinkage = Kilt.CType.fromProperties(
    'Domain Linkage Credential',
    {
        origin: {
            type: 'string',
        },
        id: {
            type: 'string',
        },
    }
);

(async () => {
    await Kilt.connect('wss://peregrine.kilt.io/parachain-public-ws');




    console.log("is it valid?", await Kilt.CType.verifyStored(ctypeDomainLinkage));
    console.log(ctypeDomainLinkage);
    await Kilt.disconnect();
})();





