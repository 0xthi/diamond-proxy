import React, { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { abi as contractAFacetAbi } from '../../artifacts/contracts/facets/ContractAFacet.sol/ContractAFacet.json';
import { abi as contractBFacetAbi } from '../../artifacts/contracts/facets/ContractBFacet.sol/ContractBFacet.json';
import addresses from '../../addresses.json';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [fetchedValue, setFetchedValue] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [superAdminAddress, setSuperAdminAddress] = useState('');

  // Use imported addresses
  const diamondAddress = addresses.diamond;
  const contractAFacetAddress = addresses.contractAFacet;
  const contractBFacetAddress = addresses.contractBFacet;

  // Add ContractAFacet to Diamond
  const { writeContract: addContractAFacet } = useWriteContract({
    abi: contractAFacetAbi,
    address: diamondAddress,
    functionName: 'diamondCut',
  });

  const handleAddContractAFacet = async () => {
    try {
      await addContractAFacet({
        args: [
          [{
            facetAddress: contractAFacetAddress,
            action: 0,  // Add
            functionSelectors: [
              "0x" + contractAFacetAbi.find(item => item.name === "setter").signature.slice(2),
              "0x" + contractAFacetAbi.find(item => item.name === "getter").signature.slice(2),
            ],
          }],
          '0x0000000000000000000000000000000000000000',
          '0x',
        ],
      });
      console.log('ContractAFacet added to Diamond');
    } catch (error) {
      console.error('Error adding ContractAFacet:', error);
    }
  };

  // Initialize ContractAFacet
  const { writeContract: initializeContractAFacet } = useWriteContract({
    abi: contractAFacetAbi,
    address: contractAFacetAddress,
    functionName: 'initializeContractAFacet',
    args: [adminAddress],
  });

  const handleInitializeContractAFacet = async () => {
    try {
      await initializeContractAFacet({
        
      });
      console.log('ContractAFacet initialized');
    } catch (error) {
      console.error('Error initializing ContractAFacet:', error);
    }
  };

  // Add ContractBFacet to Diamond
  const { writeContract: addContractBFacet } = useWriteContract({
    abi: contractBFacetAbi,
    address: diamondAddress,
    functionName: 'diamondCut',
  });

  const handleAddContractBFacet = async () => {
    try {
      await addContractBFacet({
        args: [
          [{
            facetAddress: contractBFacetAddress,
            action: 0,  // Add
            functionSelectors: [
              "0x" + contractBFacetAbi.find(item => item.name === "addAdmin").signature.slice(2),
              "0x" + contractBFacetAbi.find(item => item.name === "removeAdmin").signature.slice(2),
              // Add other function selectors for ContractBFacet
            ],
          }],
          '0x0000000000000000000000000000000000000000',
          '0x',
        ],
      });
      console.log('ContractBFacet added to Diamond');
    } catch (error) {
      console.error('Error adding ContractBFacet:', error);
    }
  };

  // Initialize ContractBFacet
  const { writeContract: initializeContractBFacet } = useWriteContract({
    abi: contractBFacetAbi,
    address: contractBFacetAddress,
    functionName: 'initializeContractBFacet',
  });

  const handleInitializeContractBFacet = async () => {
    try {
      await initializeContractBFacet({
        args: [superAdminAddress],
      });
      console.log('ContractBFacet initialized');
    } catch (error) {
      console.error('Error initializing ContractBFacet:', error);
    }
  };

  // Handle Setter
  const { writeContract: writeSetter } = useWriteContract({
    abi: contractAFacetAbi,
    address: contractAFacetAddress,
    functionName: 'setter',
  });

  const handleSetter = async () => {
    try {
      await writeSetter({
        args: [inputValue],
      });
      console.log('Setter transaction sent');
    } catch (error) {
      console.error('Error calling setter:', error);
    }
  };

  // Handle Getter
  const { data: fetchedData } = useReadContract({
    abi: contractAFacetAbi,
    address: contractAFacetAddress,
    functionName: 'getter',
  });

  return (
    <div>
      <button onClick={handleAddContractAFacet}>Add Contract A Facet</button>
      <button onClick={handleAddContractBFacet}>Add Contract B Facet</button>

      <div>
        <input
          type="text"
          value={adminAddress}
          onChange={(e) => setAdminAddress(e.target.value)}
          placeholder="Enter Admin Address"
        />
        <button onClick={handleInitializeContractAFacet}>Initialize Contract A Facet</button>
      </div>

      <div>
        <input
          type="text"
          value={superAdminAddress}
          onChange={(e) => setSuperAdminAddress(e.target.value)}
          placeholder="Enter Super Admin Address"
        />
        <button onClick={handleInitializeContractBFacet}>Initialize Contract B Facet</button>
      </div>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a value"
        />
        <button onClick={handleSetter}>Set Value</button>
      </div>

      <div>
        <button onClick={() => setFetchedValue(fetchedData ? fetchedData.toString() : '')}>
          Get Value
        </button>
        <div>Value from Contract: {fetchedValue !== '' ? fetchedValue : 'Loading...'}</div>
      </div>
    </div>
  );
}

export default App;
