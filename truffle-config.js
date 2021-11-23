require('babel-register');
require('babel-polyfill');


const HDWalletProvider = require('@truffle/hdwallet-provider');
//const HDWalletProvider = require('truffle-hdwallet-provider');
//const infuraKey = "bd3a71030ffd4e66af578f2b09777c14";////Ropsten
//const infuraKey = "fc4621d9a64840178957ed16ec31768f"//Rinkeby
//const infuraKey = "fc4621d9a64840178957ed16ec31768f"//Mumbai
//const infuraKey = "928de4355458495abef4b8ffe50545ba"//Kovan


const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();


//Mumbai

/*
module.exports = {
  networks: {
    mumbai: {//https://matic-mumbai.chainstacklabs.com|||||||https://rpc-mumbai.maticvigil.com|||||||https://rpc-mumbai.matic.today
      provider: () => new HDWalletProvider(mnemonic, `https://polygon-mumbai.infura.io/v3/fc4621d9a64840178957ed16ec31768f`),
      chainId: 80001,
      network_id: 80001,
      gas: 10000000,
      gasPrice: 3000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },//10
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",//0.6.12
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/





//Ropsten Settings
module.exports = {
  networks: {
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/bd3a71030ffd4e66af578f2b09777c14`),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}




/*
//BSC Textnet
module.exports = {
  networks: {
    testnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://data-seed-prebsc-2-s3.binance.org:8545`),//data-seed-prebsc-1-s1.binance
      network_id: 97,
      confirmations: 10,//5
      networkCheckTimeout: 1000000,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 10000000,
    },
  },//10
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",//0.6.12
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/

/*
//Mainnet Fork settings
module.exports = {
  networks: {
    fork: {
      networkCheckTimeout: 10000,
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      timeoutBlocks: 200,
      skipDryRun: true,
     // gas: 10000000,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/

/*
//Ganache settings
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777", // 5778 is increased gas blockchain
     // gas: 10000000,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/



/*
//Kovan
module.exports = {
  networks: {
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/${infuraKey}`),
      network_id: 42,       // Kovan's id
      gas: 6800000,       
      confirmations: 2,    
      timeoutBlocks: 200,  
      skipDryRun: true     
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/




/*
//Rinkeby
module.exports = {
  networks: {
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/fc4621d9a64840178957ed16ec31768f`), ///v3 not in the tutorial, but in openzepplin documentation
      network_id: 4,       // Rinkeby's id
      gas: 10000000,        // Ropsten has a lower block limit than mainnet 6800000
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.6",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
*/