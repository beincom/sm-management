"use client";

import { useWalletClient } from "wagmi";
import { createPublicClient, getAddress, getContract, http, zeroAddress } from "viem";
import { HandleConfig } from "@/contract/contractConfig";
import { useCallback, useEffect, useState } from "react";
import { handleAddresses } from "@/util/constant";

export default function HandleCard() {
  const { data: walletClient } = useWalletClient();

  const [handleSelected, setHandleSelected] =
    useState<`0x${string}`>(handleAddresses[0].address);
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [controller, setController] = useState<string>();
  const [handleTokenURI, setHandleTokenURI] = useState<string>();
  const [operator, setOperator] = useState<string>();

  const handleContract = useCallback(() => {
    if (!walletClient) return;
    const publicClient = createPublicClient({
      transport: http(),
      chain: walletClient.chain,
    });
    const handleConfig = HandleConfig(handleSelected);
    const contract = getContract({
      ...handleConfig,
      client: {
        wallet: walletClient,
        public: publicClient,
      } as any,
    });
    return contract;
  }, [walletClient, handleSelected]);

  const fetchConfig = async () => {
    if (!walletClient) return;
    const contract = handleContract();
    if (!contract) return;
    if(!handleSelected) return;

    const [name, symbol, operator, controller, handleTokenURI] = await Promise.all([
      // @ts-ignore
      contract.read.name(),
      // @ts-ignore
      contract.read.symbol(),
      // @ts-ignore
      contract.read.OPERATOR(),
      // @ts-ignore
      contract.read.CONTROLLER(),
      // @ts-ignore
      contract.read.getHandleTokenURIContract(),
    ]);

    setName(name as string);
    setSymbol(symbol as string);
    setHandleTokenURI(handleTokenURI as string);
    setController(controller as string);
    setOperator(operator as string);
  };

  const handleError = (error: any) => {
    alert(error?.message || "Unknown error");
  };

  const onUpdateOperator = async () => {
    try {
      const contract = handleContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!operator) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setOperator([operator]);

      // Handle success
      console.log("🚀 ~ onUpdateOperator ~ tx:", tx);
      fetchConfig();
      alert("Operator updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateOperator ~ error:", error);
    }
  };

  const onUpdateController = async () => {
    try {
      const contract = handleContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!controller) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setController([controller]);

      // Handle success
      console.log("🚀 ~ onUpdateController ~ tx:", tx);
      fetchConfig();
      alert("Controllet updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateController ~ error:", error);
    }
  };

  const onUpdateHandleTokenURI = async () => {
    try {
      const contract = handleContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!handleTokenURI) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setHandleTokenURIContract([handleTokenURI]);

      // Handle success
      console.log("🚀 ~ onUpdateVerifier ~ tx:", tx);
      fetchConfig();
      alert("Handle Token URI updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateVerifier ~ error:", error);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [walletClient, handleSelected]);

  return (
    <div className="card-admin">
      <a href="#">
        <h5 className="card-title">Handle Config</h5>

      </a>
      <div className="mb-5">
        <label className="form-label">Dropdown Address</label>
        <select
          className="form-select"
          value={handleSelected}
          onChange={(e) => {
            setHandleSelected(e.target.value as `0x${string}`);
          }}
        >
          {handleAddresses.map((handle) => (
            <option key={handle.address} value={getAddress(handle.address)}>
              {handle.name}
            </option>
          ))}
        </select>
        <h3>Selected Handle Name: {name}</h3>
        <h3>Selected Handle Symbol: {symbol}</h3>
      </div>
      <div className="mb-5">
        <label className="form-label">Operator</label>
        <input
          className="form-input"
          value={operator}
          onChange={(e) => {
            setOperator(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateOperator}>
          Update operator
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Controller</label>
        <input
          className="form-input"
          value={controller}
          onChange={(e) => {
            setController(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateController}>
          Update controller
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Handle Token URI</label>
        <input
          className="form-input"
          value={handleTokenURI}
          onChange={(e) => {
            setHandleTokenURI(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateHandleTokenURI}>
          Update HandleTokenURI
        </button>
      </div>
    </div>
  );
}
