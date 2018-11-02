import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import {settings} from '../settings/settings';
import {Provider} from '../providers/web3Provider.js'

const eth = new Provider(settings.NODE_URL);



export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// Note: Maybe if we are going to create something
    // it will be better to use POST method
    api.get('/createWallet', function (req, res) {

        eth.createAccount().then(
            response => {
                res.send({
                    "address" : response.address,
                    "privateKey" : response.privateKey
                })
            },
            error => {
                res.status(400).send({ error : error});
            }
        );

    });

    api.get('/getBalance/:address', function (req, res) {
            let address = req.params.address;

            if (!eth.isAddress(address)) {
                res.status(400).send({ error : "Incorrect address!"});
                return;
            }

			eth.getBalance(address).then(
				response => {
					res.send({ "balance" : response})
				},
				error => {
                    res.status(400).send({ error : error});
				}
			);

    });

    /* Body should contain JSON object with params:
    * privateKey - private key  of the source ETH address in hex format.
    * Example:  0x230D3A4046173BBFCC6C06ACF3D139201E98FC0FDAF0F8566ACCC4D912CF80CC
    * destination -  ETH destination address.
    * Example: 0x5609B291BB6D06ef9E8385Bcf6CbF92BE9C076aa
    * amount - the number of ETH to be send.
    * Example: 0.001
    */
    api.post('/transaction', function (req, res) {

        /*privateKey should be in hex format*/
        let privateKey = req.body["privateKey"];
        let destinationAddress = req.body["destination"];
        let amountETH = req.body["amount"];

        if (!privateKey || !destinationAddress || !amountETH) {
            res.status(400).send({ error : 'Some parameter is missing!'});
            return;
        }

        if (!eth.isAddress(destinationAddress)) {
            res.status(400).send({ error : "Incorrect destination address!"});
            return;
        }

        (async () => {
            try {
                let account = await eth.createAccountFromPrivateKey(privateKey);
                let gasPrice = settings.isLoadedGasPrice !== 'false' ? await eth.gasEstimate() : settings.defaultGasPrice;
                let gasLimit = settings.gasLimit;

                eth.sendRawTransaction(account, destinationAddress, `${amountETH}`, gasPrice, gasLimit).then(
                    response => {
                        res.send(response);
                    },
                    error => {
                        res.status(400).send({error: `${error}`});
                    }
                );
            } catch (error) {
                res.status(400).send({error: `${error}`});
            }


        })();

    });


	return api;
}
