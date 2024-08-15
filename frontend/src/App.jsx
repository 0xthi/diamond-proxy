import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWriteContract, useReadContract } from 'wagmi';
import { abi as contractAFacetAbi } from '../../artifacts/contracts/facets/ContractAFacet.sol/ContractAFacet.json';
import { abi as diamondAbi } from '../../artifacts/contracts/Diamond.sol/Diamond.json';
import { abi as contractBFacetAbi } from '../../artifacts/contracts/facets/ContractBFacet.sol/ContractBFacet.json';

function App() {
  const [inputValue, setInputValue] = useState(0);
  const [fetchedValue, setFetchedValue] = useState(null);

  const { writeContract: writeSetter } = useWriteContract();
  const { writeContract: writeDiamondCut } = useWriteContract();

  const { data: value, refetch } = useReadContract({
    abi: contractAFacetAbi,
    address: '0x8EeD930Ee2FcC014f83Bb7Ce578cEd2Ff176f83F', // Replace with your diamond contract address
    functionName: 'getter',
  });

  const handleSetter = () => {
    writeSetter({
      abi: contractAFacetAbi,
      address: '0x8EeD930Ee2FcC014f83Bb7Ce578cEd2Ff176f83F', // Replace with your diamond contract address
      functionName: 'setter',
      args: [inputValue],
    });
  };

  const handleGetter = async () => {
    const result = await refetch();
    setFetchedValue(result.data);
  };

  const handleDiamondCut = async () => {
    const diamondCutIface = new ethers.utils.Interface(diamondAbi);
    const contractBFacetIface = new ethers.utils.Interface(contractBFacetAbi);
  
    const encodedData = diamondCutIface.encodeFunctionData("diamondCut", [
      [{
        facetAddress: '0x2F764E82C2149b9D5F488cA440C39396a606cdF1',
        action: 0,
        functionSelectors: [
          contractBFacetIface.getSighash("addAdmin"),
          contractBFacetIface.getSighash("removeAdmin"),
          contractBFacetIface.getSighash("transferAdminRole"),
          contractBFacetIface.getSighash("renounceAdminRole"),
          contractBFacetIface.getSighash("transferSuperAdmin"),
        ],
      }],
      '0x2F764E82C2149b9D5F488cA440C39396a606cdF1',
      contractBFacetIface.encodeFunctionData("initialize", ['0x316adBe2505856d4c4D67573dC6b6648453faEa9']),
    ]);
  
    try {
      await writeDiamondCut({
        abi: diamondAbi,
        address: '0x69E6Fe8D09d1C3A1D2389df9B0fbAA244e770BA5',
        functionName: 'diamondCut',
        args: encodedData,
      });
      console.log("Diamond upgraded successfully");
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };
  
  
  
  return (
    <div>
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        placeholder="Enter a value"
      />
      <button onClick={handleSetter}>Set Value</button>
      <button onClick={handleGetter}>Get Value</button>
      <div>
        Value from Contract: {fetchedValue !== null ? fetchedValue.toString() : 'Loading...'}
      </div>
      <button onClick={handleDiamondCut}>Add ContractBFacet and Initialize</button>
    </div>
  );
}

export default App;
