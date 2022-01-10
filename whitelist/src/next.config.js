const { utils } = require("near-api-js");

module.exports = {
  images: {
    domains: ["dummyimage.com", "picsum.photos", "storage.googleapis.com"],
  },
  reactStrictMode: true,
  env: {
    CONTRACT_NAME: "whitelistfactory.testnet",
    domain: "http://localhost:3000",
    CONTRACT_CREATE_FEE: utils.format.parseNearAmount("7"),
    TICKET_PREPARE_GAS: 100000000000000,
    jsonRpcProvider: "https://rpc.testnet.near.org",
  },
};
