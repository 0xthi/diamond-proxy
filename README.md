# Diamond proxy number count

This is a test for diamon proxy contract implementation

## Steps to clone and run

1. Clone or fork this repo.
2. Run `npm install` to install packages.
3. Create .env file and setup `PRIVATE_KEY`,`RPC_URL`.
4. To test smart contracts, run `npx hardhat test`.
5. (optional)To deploy contracts, `npx hardhat scripts/deploy.js --network bsctest`.
6. (optional)To verify contracts, `npx hardhat verify --network bsctest 0xContractAddress --constructor-args ./args.js`.
7. Then `cd frontend` and `npm install` packages. Run `npm run dev` to start frontend.
