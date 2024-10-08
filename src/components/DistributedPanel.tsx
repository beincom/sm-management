'use client'

import {encodeFunctionData, formatEther, pad, parseEther} from "viem";
import {useEffect, useState} from "react";
import {
    BicFactoryConfig,
    BicRedeemFactoryConfig,
    BicRedeemTokenConfig,
    BicTokenPaymasterConfig,
    client
} from "@/contract/contractConfig";
import {useAccount, useWalletClient} from 'wagmi'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

const distributedPlan = [
    {
        id: 1,
        pool: 'Founding Community',
        unlockAddress: null,
        lockAddress: process.env.NEXT_PUBLIC_BIC_REDEEM_FACTORY_ADDRESS,
        lockAmount: BigInt("0"),
        total: parseEther('1650000000'),
        isDeployed: true,
        speedRate: null
    },
    {
        id: 2,
        pool: 'Core Team',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_CORE_TEAM_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('400000000'),
        isDeployed: false,
        speedRate: BigInt("30"), // 30 / 10_000 = 0.3%
    },
    {
        id: 3,
        pool: 'Strategic partner',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_STRATEGIC_PARTNER_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('150000000'),
        isDeployed: false,
        speedRate: BigInt("30"), // 30 / 10_000 = 0.3%
    },
    {
        id: 4,
        pool: 'Private VC Deals',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_PRIVATE_VC_DEALS_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('500000000'),
        isDeployed: false,
        speedRate: BigInt("100"), // 30 / 10_000 = 0.3%
    },
    {
        id: 5,
        pool: 'Airdrop Campaigns',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_AIRDROP_CAMPAIGNS_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('250000000'),
        isDeployed: false,
        speedRate: BigInt("50"), // 30 / 10_000 = 0.3%
    },
    {
        id: 6,
        pool: 'Community and Ecosystem Development',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_COMMUNITY_AND_ECOSYSTEM_DEVELOPMENT_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('300000000'),
        isDeployed: false,
        speedRate: BigInt("50"), // 30 / 10_000 = 0.3%
    },
    {
        id: 7,
        pool: 'Operations Fund',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_OPERATIONS_FUND_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('500000000'),
        isDeployed: false,
        speedRate: BigInt("30"), // 30 / 10_000 = 0.3%
    },
    {
        id: 8,
        pool: 'Liquidity and Exchange Reserves',
        unlockAddress: null,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('250000000'),
        isDeployed: false,
        speedRate: BigInt("30"), // 30 / 10_000 = 0.3%
    },
    {
        id: 9,
        pool: 'Foundation Reserve',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_FOUNDATION_RESERVE_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: BigInt("0"),
        total: parseEther('1000000000'),
        isDeployed: false,
        speedRate: BigInt("10"), // 30 / 10_000 = 0.3%
    }
]
const scanAddress = 'https://sepolia.arbiscan.io/address/'
export default function DistributedPanel() {
    const duration = BigInt(60*60*24*7); // 1 week
    const [plan, setPlan] = useState(distributedPlan)
    const account = useAccount()
    useEffect(() => {
        sync().catch(console.error)
    }, [])
    const { data: walletClient } = useWalletClient();
    const [isOpenDetailModal, setIsOpenDetailModal] = useState(false)
    const [poolDetail, setPoolDetail] = useState(null)
    const [isFetchingDetail, setIsFetchingDetail] = useState(false)

    async function sync() {
        const bicRedeemTokenImpl = await client.readContract({...BicRedeemFactoryConfig, functionName: 'bicRedeemImplementation'} as any)
        for (let i = 0; i < distributedPlan.length; i++) {
            const pool = distributedPlan[i]
            if(pool.unlockAddress) {
                const lockAddress = await client.readContract({
                    ...BicFactoryConfig,
                    functionName: 'computeProxyAddress',
                    args: [bicRedeemTokenImpl, pad(pool.unlockAddress, { size: 32 }) ],
                    account: process.env.NEXT_PUBLIC_SETUP_ADDRESS  as  `0x${string}`
                } as any)
                pool.lockAddress = lockAddress
                const lockCode = await client.getCode({address: lockAddress} as any)
                if(lockCode) {
                    pool.isDeployed = true
                }
            }
            if(pool.isDeployed && pool.lockAddress) {
                pool.lockAmount = await client.readContract({...BicTokenPaymasterConfig, functionName: 'balanceOf', args: [pool.lockAddress]}as any) as any
            }
            setPlan([...distributedPlan])
        }
    }

    async function createLockPool(poolId) {
        const pool = plan.find(e => e.id === poolId)
        if(!pool) {
            console.error('No pool found');
            return
        }
        if(!account.address) {
            alert('Please connect wallet')
            return
        }
        if (!walletClient) {
            console.error('No wallet client found');
            return;
        }
        if(account.address.toLowerCase() !== process.env.NEXT_PUBLIC_SETUP_ADDRESS.toLowerCase()) {
            alert('Only setup address can create lock pool')
            return
        }

        const bicBalance = await client.readContract({...BicTokenPaymasterConfig, functionName: 'balanceOf', args: [account.address]} as any)
        if((bicBalance as bigint) < pool.total) {
            alert('Insufficient BIC balance')
            return
        }
        const bicRedeemTokenImpl = await client.readContract({...BicRedeemFactoryConfig, functionName: 'bicRedeemImplementation'} as any)
        const startUnlockTime = process.env.NEXT_PUBLIC_START_POOL_TIME
        const initCode = encodeFunctionData({
            abi: BicRedeemTokenConfig(pool.lockAddress).abi,
            functionName: 'initialize',
            args: [
                BicTokenPaymasterConfig.address,
                pool.total,
                pool.unlockAddress,
                startUnlockTime,
                duration,
                pool.speedRate
            ]
        });
        await walletClient.writeContract({
            ...BicFactoryConfig,
            functionName: 'deployProxyByImplementation',
            args: [bicRedeemTokenImpl, initCode, pad(pool.unlockAddress, { size: 32 }) ],
        } as any)
        await walletClient.writeContract({
            ...BicTokenPaymasterConfig,
            functionName: 'transfer',
            args: [pool.lockAddress, pool.total]
        } as any)
        pool.isDeployed = true
        await sync()
        setIsOpenDetailModal(false)
    }

    async function fetchDetail(poolInfo) {
        console.log('start fetch detail')
        setIsOpenDetailModal(true)

        setIsFetchingDetail(true)
        let detail: any = {}
        detail.poolId = poolInfo.id
        detail.name = poolInfo.pool
        if(poolInfo.lockAddress && poolInfo.unlockAddress) {
            detail.lockAddress = poolInfo.lockAddress
            if(!poolInfo.isDeployed) {
                detail.type = 3
                detail.totalAmount = poolInfo.total
                detail.rate = poolInfo.speedRate
                detail.startTime = process.env.NEXT_PUBLIC_START_POOL_TIME
                detail.endTime = Number(process.env.NEXT_PUBLIC_START_POOL_TIME) + 10000/Number(poolInfo.speedRate) * Number(duration)
                detail.beneficiary = poolInfo.unlockAddress
            } else {
                detail.type = 0
                detail.totalAmount = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'redeemTotalAmount'} as any)
                detail.rate = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'redeemRate'} as any)
                detail.startTime = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'start'} as any)
                detail.endTime = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'end'} as any)
                detail.beneficiary = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'beneficiary'} as any)
                detail.redeemTime = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'lastAtCurrentStack'} as any)
                detail.totalRedeemTime = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'maxRewardStacks'} as any)
                detail.currentRedeemTime = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'currentRewardStacks'} as any)
                detail.amountPerRedeem = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'amountPerDuration'} as any)
                const releasable = await client.readContract({...BicRedeemTokenConfig(poolInfo.lockAddress), functionName: 'releasable'} as any)
                detail.waitingAmount = releasable[0]
                detail.waitingRedeemTime = releasable[1]
            }
        } else if (poolInfo.lockAddress) {
            detail.type = 1
            detail.note = "All amount in this pool is for Founding community only."
        } else {
            detail.type = 2
            detail.swapPool1= 'BIC/ETH'
            detail.swapPool2= 'BIC/USDT'
        }
        setPoolDetail(detail)
        setIsFetchingDetail(false)
        console.log('end fetch detail')
    }

    async function redeemPool(poolId) {
        const pool = plan.find(e => e.id === poolId)
        if(!pool) {
            console.error('No pool found');
            return
        }
        if(!account.address) {
            alert('Please connect wallet')
            return
        }
        if (!walletClient) {
            console.error('No wallet client found');
            return;
        }
        await walletClient.writeContract({
            ...BicRedeemTokenConfig(pool.lockAddress),
            functionName: 'release'
        } as any)
        await fetchDetail(pool)
    }

    return (
        <>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">#</th>
                <th scope="col" className="px-6 py-3">Pool</th>
                <th scope="col" className="px-6 py-3">Address</th>
                <th scope="col" className="px-6 py-3">Lock remain</th>
                <th scope="col" className="px-6 py-3">Total</th>
            </tr>
            </thead>
            <tbody>
            {plan.map(e => (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    key={e.pool}>
                    <td className="px-6 py-4">{e.id}</td>
                    <td className="px-6 py-4">{e.pool}</td>
                    <td className="px-6 py-4">
                        {e.lockAddress ? <><a className="lnk-primary" target="_blank" rel="noopener noreferrer"
                                              href={scanAddress + e.lockAddress}>Locked</a>
                            <br/>
                            {e.unlockAddress &&
                                <a className="lnk-primary" target="_blank" rel="noopener noreferrer"
                                   href={scanAddress + e.unlockAddress}>Unlocked</a>}</> : 'N/A'}
                    </td>
                    <td className="px-6 py-4">{e.lockAddress ? e.isDeployed ?
                            formatEther(e.lockAmount) :
                            <button className="btn-primary" onClick={() => createLockPool(e.id)}>Create lock pool</button> :
                        'N/A'
                    }</td>
                    <td className="px-6 py-4">{formatEther(e.total)}</td>
                    <td className="px-6 py-4">
                        <button className="btn-primary" onClick={() => fetchDetail(e)}>Detail</button>
                    </td>
                </tr>
            ))}
            </tbody>

        </table>
            <Dialog open={isOpenDetailModal} onClose={setIsOpenDetailModal} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            {poolDetail?.name}
                                        </DialogTitle>
                                        {isFetchingDetail && <div className="mt-2">
                                            <p className="text-sm text-gray-500">Fetching data ...</p>
                                        </div>}
                                        {poolDetail?.note && <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {poolDetail.note}
                                            </p>
                                        </div>}
                                        {poolDetail?.type == 2 && <div className="mt-2">
                                            <a href="#" className="lnk-primary">{poolDetail.swapPool1}</a>
                                            <br/>
                                            <a href="#" className="lnk-primary">{poolDetail.swapPool2}</a>
                                        </div>}
                                        {(poolDetail?.type == 3 || poolDetail?.type == 0 ) && <div className="mt-2">
                                            {Object.keys(poolDetail).map((key) => {
                                                if(key == 'type' || key == 'name') return
                                                return (
                                                    <div key={key} className="flex justify-between">
                                                        <span>{key}:</span>
                                                        <span>{ key === 'startTime' || key === 'endTime' || key === 'redeemTime' ? new Date(Number(poolDetail[key]) * 1000).toLocaleString() :
                                                            key === 'totalAmount' || key === 'amountPerRedeem' || key === 'waitingAmount' ? formatEther(poolDetail[key]) :
                                                                key === 'rate' ? `${Number(poolDetail[key]) / 10_000 * 100}%` :
                                                                    key === 'beneficiary' || key === 'lockAddress' ? <a className="lnk-primary" target="_blank" rel="noopener noreferrer"
                                                                                               href={"https://sepolia.etherscan.io/address/" + poolDetail[key]}>{poolDetail[key]}</a> :
                                                                        key === 'totalRedeemTime' || key === 'currentRedeemTime' || key === 'waitingRedeemTime' ? `${poolDetail[key]}/${poolDetail.totalRedeemTime}` :
                                                                                    poolDetail[key]
                                                        }</span>
                                                        <br/>
                                                    </div>
                                                )
                                            })}
                                        </div>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                {poolDetail?.type == 3 && <button
                                    type="button"
                                    onClick={() => createLockPool(poolDetail.poolId)}
                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                >
                                    Create pool
                                </button>}
                                {poolDetail?.type == 0 && poolDetail?.waitingRedeemTime > 0 && <button
                                    type="button"
                                    onClick={() => redeemPool(poolDetail.poolId)}
                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                >
                                    Claim redeem
                                </button>}
                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => {
                                        setIsOpenDetailModal(false)
                                        setPoolDetail(null)
                                    }}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}
