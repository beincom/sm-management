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

const distributedPlan = [
    {
        id: 1,
        pool: 'Founding Community',
        unlockAddress: null,
        lockAddress: process.env.NEXT_PUBLIC_BIC_REDEEM_FACTORY_ADDRESS,
        lockAmount: 0n,
        total: parseEther('1650000000'),
        isDeployed: true,
        speedRate: null
    },
    {
        id: 2,
        pool: 'Core Team',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_CORE_TEAM_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('400000000'),
        isDeployed: false,
        speedRate: 30n, // 30 / 10_000 = 0.3%
    },
    {
        id: 3,
        pool: 'Strategic partner',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_STRATEGIC_PARTNER_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('150000000'),
        isDeployed: false,
        speedRate: 30n, // 30 / 10_000 = 0.3%
    },
    {
        id: 4,
        pool: 'Private VC Deals',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_PRIVATE_VC_DEALS_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('500000000'),
        isDeployed: false,
        speedRate: 100n, // 30 / 10_000 = 0.3%
    },
    {
        id: 5,
        pool: 'Airdrop Campaigns',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_AIRDROP_CAMPAIGNS_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('250000000'),
        isDeployed: false,
        speedRate: 50n, // 30 / 10_000 = 0.3%
    },
    {
        id: 6,
        pool: 'Community and Ecosystem Development',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_COMMUNITY_AND_ECOSYSTEM_DEVELOPMENT_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('300000000'),
        isDeployed: false,
        speedRate: 50n, // 30 / 10_000 = 0.3%
    },
    {
        id: 7,
        pool: 'Operations Fund',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_OPERATIONS_FUND_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('500000000'),
        isDeployed: false,
        speedRate: 30n, // 30 / 10_000 = 0.3%
    },
    {
        id: 8,
        pool: 'Liquidity and Exchange Reserves',
        unlockAddress: null,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('250000000'),
        isDeployed: false,
        speedRate: 30n, // 30 / 10_000 = 0.3%
    },
    {
        id: 9,
        pool: 'Foundation Reserve',
        unlockAddress: process.env.NEXT_PUBLIC_POOL_FOUNDATION_RESERVE_UNLOCK_ADDRESS,
        lockAddress: null,
        lockAmount: 0n,
        total: parseEther('1000000000'),
        isDeployed: false,
        speedRate: 10n, // 30 / 10_000 = 0.3%
    }
]

export default function DistributedPanel() {
    const [plan, setPlan] = useState(distributedPlan)
    const account = useAccount()
    useEffect(() => {
        sync().catch(console.error)
    }, [])
    const { data: walletClient } = useWalletClient();

    async function sync() {
        const bicRedeemTokenImpl = await client.readContract({...BicRedeemFactoryConfig, functionName: 'bicRedeemImplementation'})
        console.log('bicRedeemTokenImpl: ', bicRedeemTokenImpl)
        for (let i = 0; i < distributedPlan.length; i++) {
            const pool = distributedPlan[i]
            if(pool.unlockAddress) {
                const lockAddress = await client.readContract({
                    ...BicFactoryConfig,
                    functionName: 'computeProxyAddress',
                    args: [bicRedeemTokenImpl, pad(pool.unlockAddress, { size: 32 }) ],
                    account: process.env.NEXT_PUBLIC_SETUP_ADDRESS
                })
                console.log('lockAddress: ', lockAddress)
                pool.lockAddress = lockAddress
                const lockCode = await client.getCode({address: lockAddress})
                console.log('i: ', i)
                console.log('lockCode: ', lockCode)
                if(lockCode) {
                    pool.isDeployed = true
                }
            }
            if(pool.isDeployed && pool.lockAddress) {
                pool.lockAmount = await client.readContract({...BicTokenPaymasterConfig, functionName: 'balanceOf', args: [pool.lockAddress]})
                console.log('pool.lockAmount: ', pool.lockAmount)
            }
            // const lockAddress = await BicRedeemFactory.bicRedeemFactory.getLockAddress(pool.id)
        }
        setPlan([...distributedPlan])
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

        const bicBalance = await client.readContract({...BicTokenPaymasterConfig, functionName: 'balanceOf', args: [account.address]})
        console.log('bicBalance: ', bicBalance)
        // if(bicBalance < pool.total) {
        //     alert('Insufficient BIC balance')
        //     return
        // }
        const bicRedeemTokenImpl = await client.readContract({...BicRedeemFactoryConfig, functionName: 'bicRedeemImplementation'})
        const startUnlockTime = process.env.NEXT_PUBLIC_START_POOL_TIME
        const duration = BigInt(60*60*24*7); // 1 week
        console.log('predictLockAddress: ', predictLockAddress)
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
        console.log('initCode: ', initCode)
        await walletClient.writeContract({
            ...BicFactoryConfig,
            functionName: 'deployProxyByImplementation',
            args: [bicRedeemTokenImpl, initCode, pad(pool.unlockAddress, { size: 32 }) ],
        })
        console.log('pool.lockAddress: ', pool.lockAddress)
        await walletClient.writeContract({
            ...BicTokenPaymasterConfig,
            functionName: 'transfer',
            args: [pool.lockAddress, pool.total]
        })
        pool.isDeployed = true
        setPlan(plan);
    }

    return (
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
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={e.pool}>
                    <td className="px-6 py-4">{e.id}</td>
                    <td className="px-6 py-4">{e.pool}</td>
                    <td className="px-6 py-4">
                        {e.lockAddress ? <><a className="lnk-primary" target="_blank" rel="noopener noreferrer"
                                              href={"https://sepolia.etherscan.io/address/" + e.lockAddress}>Locked</a>
                            <br/>
                            {e.unlockAddress &&
                                <a className="lnk-primary" target="_blank" rel="noopener noreferrer"
                                   href={"https://sepolia.etherscan.io/address/" + e.unlockAddress}>Unlocked</a>}</> : 'N/A'}
                    </td>
                    <td className="px-6 py-4">{e.lockAddress ? e.isDeployed ?
                            formatEther(e.lockAmount) :
                            <button className="btn-primary" onClick={() => createLockPool(e.id)}>Create lock pool</button> :
                        'N/A'
                    }</td>
                    <td className="px-6 py-4">{formatEther(e.total)}</td>
                    <td className="px-6 py-4">
                        <button className="btn-primary">Detail</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}
