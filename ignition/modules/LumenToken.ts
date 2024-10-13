// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_SUPPLY = BigInt(1000000); // Define initial supply for LumenToken

const LumenTokenModule = buildModule("LumenTokenModule", (m) => {
  const lumenToken = m.contract("LumenToken", [INITIAL_SUPPLY]);

  return { lumenToken };
});

export default LumenTokenModule;
