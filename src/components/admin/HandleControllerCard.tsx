"use client";

import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, getContract, http } from "viem";
import { HandleControllerConfig } from "@/contract/contractConfig";
import { useCallback, useEffect, useState } from "react";

export default function HandleControllerCard() {
  const { data: walletClient } = useWalletClient();
  const [owner, setOwner] = useState<string>();
  const [forwarder, setForwarder] = useState<string>();
  const [verifier, setVerifier] = useState<string>();
  const [marketplace, setMarketplace] = useState<string>();
  const [collector, setCollector] = useState<string>();
  const [auctionConfig, setAuctionConfig] = useState<{
    buyoutBidAmount: string;
    timeBufferInSeconds: string;
    bidBufferBps: string;
  }>({
    bidBufferBps: "0",
    timeBufferInSeconds: "0",
    buyoutBidAmount: "0",
  });

  const handleControllerContract = useCallback(() => {
    if (!walletClient) return;
    const publicClient = createPublicClient({
      transport: http(),
      chain: walletClient.chain,
    });

    const contract = getContract({
      ...HandleControllerConfig,
      client: {
        wallet: walletClient,
        public: publicClient,
      } as any,
    });
    return contract;
  }, [walletClient]);

  const fetchConfig = async () => {
    if (!walletClient) return;
    const contract = handleControllerContract();
    if (!contract) return;

    const [marketplace, verifier, owner, forwarder, collector, auctionConfig] =
      await Promise.all([
        // @ts-ignore
        contract.read.marketplace(),
        // @ts-ignore
        contract.read.verifier(),
        // @ts-ignore
        contract.read.owner(),
        // @ts-ignore
        contract.read.forwarder(),
        // @ts-ignore
        contract.read.collector(),
        // @ts-ignore
        contract.read.auctionConfig(),
      ]);

    setOwner(owner as string);
    setForwarder(forwarder as string);
    setVerifier(verifier as string);
    setMarketplace(marketplace as string);
    setCollector(collector as string);

    setAuctionConfig({
      buyoutBidAmount: (auctionConfig as any)[0]?.toString(),
      timeBufferInSeconds: (auctionConfig as any)[1]?.toString(),
      bidBufferBps: (auctionConfig as any)[2]?.toString(),
    });
  };

  const handleError = (error: any) => {
    alert(error?.message || "Unknown error");
  };

  const onUpdateOwner = async () => {
    try {
      const contract = handleControllerContract();
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
      alert("Owner updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateOwner ~ error:", error);
    }
  };

  const onUpdateCollector = async () => {
    try {
      const contract = handleControllerContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!collector) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setCollector([collector]);

      // Handle success
      console.log("🚀 ~ onUpdateCollector ~ tx:", tx);
      fetchConfig();
      alert("Collector updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateCollector ~ error:", error);
      handleError(error);
    }
  };

  const onUpdateAuctionConfig = async () => {
    try {
      const contract = handleControllerContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!auctionConfig) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setAuctionMarketplaceConfig([
        [
          auctionConfig?.buyoutBidAmount,
          auctionConfig?.timeBufferInSeconds,
          auctionConfig?.bidBufferBps,
        ],
      ]);

      // Handle success
      console.log("🚀 ~ onUpdateCollector ~ tx:", tx);
      fetchConfig();
      alert("Auction config updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateCollector ~ error:", error);
      handleError(error);
    }
  };

  const onUpdateMarketplace = async () => {
    try {
      const contract = handleControllerContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!marketplace) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setMarketplace([marketplace]);

      // Handle success
      console.log("🚀 ~ onUpdateMarketplace ~ tx:", tx);
      fetchConfig();
      alert("Marketplace updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateMarketplace ~ error:", error);
      handleError(error);
    }
  };

  const onUpdateForwarder = async () => {
    try {
      const contract = handleControllerContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!forwarder) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setForwarder([forwarder]);

      // Handle success
      console.log("🚀 ~ onUpdateForwarder ~ tx:", tx);
      fetchConfig();
      alert("Forwarder updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateForwarder ~ error:", error);
      handleError(error);
    }
  };

  const onUpdateVerifier = async () => {
    try {
      const contract = handleControllerContract();
      if (!contract) {
        // Handle notification
        return;
      }
      if (!verifier) {
        // Handle notification
        return;
      }
      // @ts-ignore
      const tx = await contract.write.setVerifier([verifier]);

      // Handle success
      console.log("🚀 ~ onUpdateVerifier ~ tx:", tx);
      fetchConfig();
      alert("Verifier updated successfully");
    } catch (error) {
      // Handle error
      console.log("🚀 ~ onUpdateVerifier ~ error:", error);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [walletClient]);
  return (
    <div className="card-admin">
      <a href="#">
        <h5 className="card-title">Handle Controller</h5>
      </a>
      <div className="mb-5">
        <label className="form-label">Owner</label>
        <input
          className="form-input"
          value={owner}
          onChange={(e) => {
            setOwner(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateOwner}>
          Update owner
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Verifier</label>
        <input
          className="form-input"
          value={verifier}
          onChange={(e) => {
            setVerifier(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateVerifier}>
          Update verifier
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Forwarder</label>
        <input
          className="form-input"
          value={forwarder}
          onChange={(e) => {
            setForwarder(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateForwarder}>
          Update forwarder
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Marketplace</label>
        <input
          className="form-input"
          value={marketplace}
          onChange={(e) => {
            setMarketplace(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateMarketplace}>
          Update marketplace
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Collector</label>
        <input
          className="form-input"
          value={collector}
          onChange={(e) => {
            setCollector(e.target.value);
          }}
        />
        <button className="btn-danger" onClick={onUpdateCollector}>
          Update collector
        </button>
      </div>
      <div className="mb-5">
        <label className="form-label">Marketplace auction config</label>
        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          <div className="col-span-5 row-span-3">
            <label className="form-label">Buyout Bid Amount</label>
            <input
              type="number"
              className="form-input"
              value={auctionConfig?.buyoutBidAmount}
              onChange={(e) => {
                setAuctionConfig({
                  ...auctionConfig,
                  buyoutBidAmount: e.target.value,
                });
              }}
            />
          </div>
          <div className="col-span-5 row-span-3">
            <label className="form-label">Time Buffer In Seconds</label>
            <input
              type="number"
              className="form-input"
              value={auctionConfig?.timeBufferInSeconds}
              onChange={(e) => {
                setAuctionConfig({
                  ...auctionConfig,
                  timeBufferInSeconds: e.target.value,
                });
              }}
            />
          </div>
          <div className="col-span-5 row-span-3">
            <label className="form-label">Bid buffer Basic point</label>
            <input
              type="number"
              className="form-input"
              value={auctionConfig?.bidBufferBps}
              onChange={(e) => {
                setAuctionConfig({
                  ...auctionConfig,
                  bidBufferBps: e.target.value,
                });
              }}
            />
          </div>
        </div>
        <button className="btn-danger" onClick={onUpdateAuctionConfig}>
          Update auction config
        </button>
      </div>
    </div>
  );
}
