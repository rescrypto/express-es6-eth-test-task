export const settings = {
    NODE_URL: process.env.NODE_URL || "https://ropsten.infura.io",
    isLoadedGasPrice: process.env.isLoadedGasPrice || 'true',
    typeOfLoadedGasPrice: process.env.typeOfLoadedGasPrice || 'average', // safeLow, average, fast, fastest
    gasLimit: process.env.gasLimit || '21000',
    chainId: process.env.chainId || 3,
    defaultGasPrice : process.env.defaultGasPrice || '0.0000001'
};