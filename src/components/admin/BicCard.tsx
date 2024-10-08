"use client";

import { BicTokenPaymasterConfig, client } from "@/contract/contractConfig";
import { useCallback, useEffect, useState } from "react";
import {createPublicClient, getContract, http, isAddress, parseEther} from "viem";
import { useWalletClient } from "wagmi";
import {getEtherscanUrl} from "@/util/util";

export default function BicCard() {
  const { data: walletClient } = useWalletClient();
  const [owner, setOwner] = useState<string>();
  const [oracle, setOracle] = useState<string>();
  const [paused, setPaused] = useState<boolean>();
  const [isBlockAddress, setIsBlockAddress] = useState<boolean>();
  const [blockAddress, setBlockAddress] = useState<string>();
  const [factory, setFactory] = useState<string>();
  const [deposit, setDeposit] = useState<number>();
  const [deposited, setDeposited] = useState<number>(0);
    const [stake, setStake] = useState<number>();

  const bicContract = useCallback(() => {
    if (!walletClient) return;
    const publicClient = createPublicClient({
      transport: http(),
      chain: walletClient.chain,
    });
    const contract = getContract({
      ...BicTokenPaymasterConfig,
      client: {
        wallet: walletClient,
        public: publicClient,
      } as any,
    });
    return contract;
  }, [walletClient]);

  const fetchConfig = async () => {
    if (!walletClient) return;
    const contract = bicContract();
    if (!contract) return;

    const [oracle, owner, paused, deposited] = await Promise.all([
        // @ts-ignore
      contract.read.oracle(),
        // @ts-ignore
      contract.read.owner(),
        // @ts-ignore
      contract.read.paused(),
        // @ts-ignore
      contract.read.getDeposit(),
    ]);

    setPaused(paused as boolean);
    setOracle(oracle as string);
    setOwner(owner as string);
    setDeposited(deposited as number);
  };

  useEffect(() => {
    fetchConfig();
  }, [walletClient]);

  const handleError = (error: any) => {
    alert(error?.message || "Unknown error");
  };

  const onUpdateOracle = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!oracle) {
        // Handle notification
        return;
      }
        // @ts-ignore
      const tx = await contract.write.setOracle([oracle]);

      // Handle success
      console.log("🚀 ~ onUpdateOracle ~ tx:", tx);
      fetchConfig();
      alert("Oracle updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateOracle ~ error:", error);
      handleError(error);
    }
  };

  const onUpdateOwner = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!owner) {
        // Handle notification
        return;
      }
        // @ts-ignore
      const tx = await contract.write.transferOwnership([owner]);

      // Handle success
      console.log("🚀 ~ onUpdateOwner ~ tx:", tx);
      fetchConfig();
      alert("Oracle updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateOwner ~ error:", error);
      handleError(error);

    }
  };

  const onPauseContract = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!paused) {
          // @ts-ignore
        const tx = await contract.write.pause();
        console.log("🚀 ~ onUpdateOracle ~ tx:", tx);
      }
      if (paused) {
          // @ts-ignore
        const tx = await contract.write.unpause();
        console.log("🚀 ~ onPauseContract ~ tx:", tx);
      }

      // Handle success
      fetchConfig();
      alert("Update status paused successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onPauseContract ~ error:", error);
      handleError(error);

    }
  };

  const onUpdateFactory = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!factory) {
        // Handle notification
        return;
      }
        // @ts-ignore
      const tx = await contract.write.addFactory([factory]);

      // Handle success
      console.log("🚀 ~ onUpdateFactory ~ tx:", tx);
      fetchConfig();
      alert("Factory updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateFactory ~ error:", error);
      handleError(error);
    }
  }

  const onBlockAddress = async () => {
    try {
      console.log('dasdasdsddaa!!')
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      console.log('blockAddress: ', blockAddress)
      if (blockAddress) {
          // @ts-ignore
        const tx = await contract.write.addToBlockedList([blockAddress]);
        console.log("🚀 ~ onBlockAddress ~ tx:", tx);
      }
    } catch (error) {
        // Handle error
        console.log("🚀 ~ onBlockAddress ~ error:", error);
        handleError(error);
    }
  }

  const onUnblockAddress = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (blockAddress) {
          // @ts-ignore
        const tx = await contract.write.removeFromBlockedList([blockAddress]);
        console.log("🚀 ~ onUnblockAddress ~ tx:", tx);
      }
    } catch (error) {
        // Handle error
        console.log("🚀 ~ onUnblockAddress ~ error:", error);
        handleError(error);
    }
  }

  const onDeposit = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (deposit) {
          // @ts-ignore
        const tx = await contract.write.deposit({value: parseEther(deposit.toString())});
        console.log("🚀 ~ onDeposit ~ tx:", tx);
      }
    } catch (error) {
        // Handle error
        console.log("🚀 ~ onDeposit ~ error:", error);
        handleError(error);
    }
  }

  const onWithdrawDeposit = async () => {
    try {
      const contract = bicContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (deposit) {
          // @ts-ignore
        const tx = await contract.write.withdrawTo([deposit, walletClient.address]);
        console.log("🚀 ~ onWithdrawDeposit ~ tx:", tx);
      }
    } catch (error) {
        // Handle error
        console.log("🚀 ~ onWithdrawDeposit ~ error:", error);
        handleError(error);
    }
  }

    const onStake = async () => {
        try {
        const contract = bicContract();
        if (!contract) {
            // Handle notification
            return;
        }
        if (stake) {
            // @ts-ignore
            const tx = await contract.write.addStake({args: [86400], value: parseEther(stake)});
            console.log("🚀 ~ onStake ~ tx:", tx);
        }
        } catch (error) {
            // Handle error
            console.log("🚀 ~ onStake ~ error:", error);
            handleError(error);
        }
    }

    const onWithdrawStake = async () => {
        try {
        const contract = bicContract();
        if (!contract) {
            // Handle notification
            return;
        }
        if (stake) {
            // @ts-ignore
            const tx = await contract.write.withdrawStake([walletClient.address]);
            console.log("🚀 ~ onWithdrawStake ~ tx:", tx);
        }
        } catch (error) {
          // Handle error
          console.log("🚀 ~ onWithdrawStake ~ error:", error);
          handleError(error);
        }
    }

    const onUnlockStake = async () => {
        try {
        const contract = bicContract();
        if (!contract) {
            // Handle notification
            return;
        }
        if (stake) {
            // @ts-ignore
            const tx = await contract.write.unlockStake([]);
            console.log("🚀 ~ onUnlockStake ~ tx:", tx);
        }
        } catch (error) {
          // Handle error
          console.log("🚀 ~ onUnlockStake ~ error:", error);
          handleError(error);
        }
    }

  return (
      <div className="card-admin">
        <a href={getEtherscanUrl(BicTokenPaymasterConfig.address)} target='_blank'>
          <h5 className="card-title">BIC & Paymaster</h5>
        </a>
        <div className="mb-5">
          <label className="form-label">Owner</label>
          <input
              type="email"
              className="form-input"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
          />
          <button className="btn-danger" onClick={onUpdateOwner}>
            Update owner
          </button>
        </div>
        <div className="mb-5">
          <label className="form-label">Pause/Unpause</label>
          <p className="form-explain">
            Current: {paused ? "Paused" : "Unpaused"}
          </p>
        </div>
        <button className="btn-danger" onClick={onPauseContract}>
          {!paused ? "Paused" : "Unpaused"}
        </button>
        <div className="card-admin">
          <div className="mb-5">
            <label
                className="form-label">Block Address</label>
            <input type="text"
                   value={blockAddress}
                   className="form-input"
                     onChange={(e) => {
                       const value = e.target.value
                       setBlockAddress(value)
                       if(isAddress(value)) {
                         const contract = bicContract();
                            if (!contract) {
                            // Handle notification
                            return;
                            }
                           // @ts-ignore
                            contract.read.isBlocked([value]).then((isBlock) => {
                                setIsBlockAddress(isBlock as boolean)
                                })
                       }
                     }}
            />
            <p className="form-explain">Is Block?: {isBlockAddress?.toString()}</p>
          </div>
          <button className="btn-danger" onClick={onBlockAddress}>
            Block
          </button>
          <button className="btn-danger" onClick={onUnblockAddress}>
            Unblock
          </button>
        </div>
        <h5 className="card-title">Paymaster</h5>
        <div className="card-admin">
          <div className="mb-5">
            <label
                className="form-label">Oracle</label>
            <input
                type="email"
                className="form-input"
                value={oracle}
                onChange={(e) => setOracle(e.target.value)}
            />
            <p className="form-explain">Current: {oracle}</p>
          </div>
          <button className="btn-danger" onClick={onUpdateOracle}>
            Change
          </button>
        </div>
        <div className="card-admin">
          <div className="mb-5">
            <label
                className="form-label">Add factory</label>
            <input type="text"
                     value={factory}
                   className="form-input"
                     onChange={(e) => setFactory(e.target.value)}
            />
          </div>
          <button className="btn-danger" onClick={onUpdateFactory}>
            Add
          </button>
        </div>
        <div className="card-admin">
          <div className="mb-5">
            <label
                className="form-label">Deposit</label>
            <input type="number"
                   value={deposit}
                   className="form-input"
                   onChange={
                       // @ts-ignore
                (e) => setDeposit(e.target.value)
            }
            />
            <p className="form-explain">Current: {deposited}</p>
          </div>
          <button className="btn-danger" onClick={onDeposit}>
            Deposit
          </button>
          <button className="btn-danger" onClick={onWithdrawDeposit}>
            Withdraw
          </button>
        </div>
        <div className="card-admin">
          <div className="mb-5">
            <label
                className="form-label">Stake</label>
            <input type="number"
                   value={stake}
                   className="form-input" onChange={
                // @ts-ignore
                (e) => setStake(e.target.value)}/>
          </div>
          <button className="btn-danger" onClick={onStake}>
            Stake
          </button>
          <button className="btn-danger" onClick={onUnlockStake}>
            Unlock stake
          </button>
          <button className="btn-danger" onClick={onWithdrawStake}>
            Withdraw stake
          </button>
        </div>
      </div>
  );
}
