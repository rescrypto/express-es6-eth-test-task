import Web3 from "web3";
import {settings} from '../settings/settings';
import request from "request";

export class Provider {

    constructor(networkURL) {
        this.networkURL = networkURL;
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.networkURL));

        this.gasPrice = settings.defaultGasPrice;
        this.gasLimit = settings.gasLimit;
    }

    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address).then(result => {
                    resolve(this.fromWei(result));
                },
                error => {
                    reject(error)
                });
        });
    }

    isAddress(address) {
        return this.web3.utils.isAddress(address);
    }

    async createAccountFromPrivateKey(privateKey) {
        return await this.web3.eth.accounts.wallet.add(privateKey);
    }

    async createAccount() {
        return await this.web3.eth.accounts.create();
    }


    async sendRawTransaction(account, to, amount, gasPrice, gasLimit, countTransactions) {
        let tx = {
                from: account.address,
                to: to,
                value: this.toHex(this.toWei(amount)),
                nonce: this.toHex(countTransactions ? countTransactions : await this.getTransactionCount(account.address)),
                gasPrice: this.toHex(this.toWei(gasPrice ? gasPrice : this.gasPrice)),
                gasLimit: this.toHex(gasLimit ? gasLimit : this.gasLimit),
                chainId: settings.chainId
            },
            serializedTx = await account.signTransaction(tx);
        return this.web3.eth.sendSignedTransaction(serializedTx.rawTransaction);
    }


    /*
     Additional methods
    */

    gasEstimate = function () {
        return new Promise((resolve, reject) => {
            request.get({
                headers: {'content-type': 'application/json'},
                url: 'https://ethgasstation.info/json/ethgasAPI.json',
            }, function (error, response, body) {

                if (error)
                    resolve(settings.defaultGasPrice);

                if (body) {
                    let price = JSON.parse(body)[settings.typeOfLoadedGasPrice];
                    if (!price) {
                        price = 1000;
                    }
                    resolve((price / 10 / 10 ** 9).toFixed(12));
                } else {
                    resolve(settings.defaultGasPrice);
                }


            });
        });
    };

    getTransactionCount(address) {
        return this.web3.eth.getTransactionCount(address)
    }

    toHex(value) {
        return this.web3.utils.toHex(value);
    }

    fromWei(value) {
        return this.web3.utils.fromWei(value, 'ether');
    }

    toWei(value) {
        return this.web3.utils.toWei(value, 'ether');
    }

}