import React, { useEffect, useState } from 'react';
import './wallet.css';
import {stakingContract} from '../contractAbi/contract';
import {tokenContract} from '../contractAbi/tokenCa';
import { tokenAbi } from '../contractAbi/tokenabi';
import {stakingAbi} from '../contractAbi/abi';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const  {ethers}  = require("ethers");


const Wallet = () => {

    const {ethereum}=window;    
    const [walletAddress,setWalletAddress]=useState('Connect Wallet');
    const [walletStatu,setWalletStatus]=useState(false);
    const [balance,setBalance]=useState(0);
    const [currentNetwork,setCurrentNetwork]= useState('');
    const [chainStatus,setChainStatus]=useState('');
    const [symbol,setSymbole]=useState('');
    const [stakeBalance,setStakeBalance]=useState(0);
    const [UnStakeBalance,setUnStakeBalance]=useState(0);
    const [LockDuration,setLockDuration]=useState('0');
    const [apr,setApr]=useState(0);
    const [currentApr,setCurrentApr]=useState(0);
    const [totalStake,setTotalStake]=useState(0);
    const [showReward,setShowReward]=useState(0);
    const [endDate,setEndDate]=useState("Unknown");
    const expectedNetworkId='15551'
    let tokenContractData;
    let StakingContractData;
    let provider;
const notify = () => toast.success('Wallet connected successfully 🥳', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition:Bounce,
    }
);
if (window.ethereum) {
    provider=new ethers.providers.Web3Provider(window.ethereum)
}else{
    provider=new ethers.providers.JsonRpcProvider("https://api.mainnetloop.com");
}
const signerOrProvider=window.ethereum?provider.getSigner():provider;
const HandleConnect = async () => {
    try {
        if ( typeof window.ethereum !== "undefined") {
            await ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            });
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(formatWalletAddress(accounts[0]));
            setWalletStatus(true);
            notify();
            handleEndDate();
            handlCurrentApr();
            handleEndDate();
            handleShowRewardBalance();
            handleStakebalance();
            handleUnstakeBalance();
            HandleBalancecheck();
            if (walletStatu) {
                setWalletStatus(true);
                setWalletAddress(formatWalletAddress(accounts[0]));
            }
        } else if (!(window.ethereum)) {
            toast.success("Install MetaMask", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            });
        }
    } catch (error) {
        if (error.code === 4001 && walletStatu) {
           
            toast.error("Metamask Tx denied", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            }); 
    }else if (error.code===4001 && !walletStatu){
        toast.error("Please Connect your wallet", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
            theme: "dark",
            transition: Bounce,
        }); 
    }
 }
}
    const formatWalletAddress = (address) => {
        if (address.length > 10) {
            return address.slice(0, 6) + "......." + address.slice(-4);
        } else {
            return address;
        }
    }
    useEffect(()=>{
        if (ethereum) {
            ethereum.on && ethereum.on("accountsChanged", (accounts) => {
                setWalletAddress(formatWalletAddress(accounts[0]));
            });
         if (walletStatu) {
                HandleBalancecheck(); 
               handleStakebalance(); 
                 handlCurrentApr();
                handleUnstakeBalance();
               handleShowRewardBalance();
         }
         handleTotalSupply();
         handleTokenSymbole();
     
            const fetchNetworkId = async () => {
                try {
                    const networkId = await ethereum.request({ method: 'net_version' });
                    setCurrentNetwork(networkId);
                } catch (error) {
                    console.error("Error detecting network:", error);
                    setCurrentNetwork("Unknown");
                }
            };
    
            fetchNetworkId();
    
            const handleChainChanged = (chainId) => {
                setCurrentNetwork(chainId);
            };
    
            ethereum.on && ethereum.on('chainChanged', handleChainChanged);
    
            return () => {
                ethereum.off && ethereum.off('chainChanged', handleChainChanged);
            };
        } else {
            console.error("Ethereum object not available.");
        }
    });
    useEffect(()=>{
        try {
            if (expectedNetworkId!==currentNetwork && walletStatu) {
                setChainStatus("You are in wrong network,Please switch it")
            }else if (expectedNetworkId===currentNetwork && walletStatu) {
                setChainStatus("You are in correct Chain 😄")
            }else{
                return;
            }
        } catch (error) {
            console.log("You hav Rejected tx")
        }
    },[currentNetwork,walletStatu]);
    const handleSwicthChain=async()=>{
        try {
         await ethereum.request({method:"wallet_addEthereumChain",
         params:[{
           chainId:`0x3cbf`,
           chainName:"Loop Network",
           nativeCurrency:{
             name:"Loop Network",
             symbol: "Loop",
             decimals:18
           },
           rpcUrls:["https://api.mainnetloop.com"],
           blockExplorerUrls:["https://explorer.mainnetloop.com/"]
         }]
      });
      
      if (expectedNetworkId!==currentNetwork) {
        toast.success('Network switch is on proccesing... 🥳', {
            position: "top-center",
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
            theme: "dark",
            transition:Bounce,
            }
        );
      }
      else if(expectedNetworkId===currentNetwork) {
        setChainStatus("You have already switched ");
        toast.success('You have already switched 🥳', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition:Bounce,
            }
        );
      }
        } catch (error) {
         setChainStatus(error)
        }
     }
     const HandleBalancecheck = async () => {
        try {
          tokenContractData = new ethers.Contract(tokenContract, tokenAbi, signerOrProvider);
          const walletAddress = await signerOrProvider.getAddress();
          const checksumAddress = ethers.utils.getAddress(walletAddress);
          const getbalance = await tokenContractData.balanceOf(checksumAddress);
          setBalance(ethers.utils.formatUnits(getbalance, 8));
        } catch (error) {
          console.log("error is ", error);
        }
      }
      const handleDisconnect = () => {
         toast.info("Disconnect Success 😏", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
            theme: "dark",
            transition: Bounce,
        });
        setWalletAddress("Connect Wallet");
        setWalletStatus(false);
        setBalance(0);
        setCurrentApr(0);
        setLockDuration(0);
        setUnStakeBalance(0);
        setStakeBalance(0);
        setEndDate("Unknown End Time");
        setShowReward(0);
        
    }
    const HandleStake = async (e) => {
        e.preventDefault();
        if (!walletStatu) {
            HandleConnect();
            return;
        }
      if (walletStatu) {
        try {
            tokenContractData = new ethers.Contract(tokenContract, tokenAbi, signerOrProvider);
            const amount = e.target.elements.amount.value; 
            const amountToString = ethers.utils.parseUnits(amount,8);
            const walletProvider= await signerOrProvider.getAddress()
            const walletSum= ethers.utils.getAddress(walletProvider);
            if ( amountToString==0) {
                toast.info("Amount should be greater than 0", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: 0,
                    theme: "dark",
                    transition: Bounce,
                });
                return
            }else if (balance==0) {
                toast.info("Your wallet balance is 0", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: 0,
                    theme: "dark",
                    transition: Bounce,
                });
                return
            }else if (amountToString>=balance) {
                toast.info("Your don't have enough balance 🥵", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: 0,
                    theme: "dark",
                    transition: Bounce,
                });
                return
            }
            else{
                const currentAllowance = await tokenContractData.allowance(walletSum, stakingContract);
                
                if (currentAllowance.lt(amountToString)) {
                 const TxApp= await tokenContractData.approve(stakingContract, amountToString);
                 await TxApp.wait();
                toast.success('Token approval successful', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
     }
          
            StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
            const tx = await StakingContractData.Stake(amountToString,parseInt(LockDuration),apr );
            const toastId = toast.loading("Staking in progress 🔥🔥🔥", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            });
    
            await tx.wait();
            toast.dismiss(toastId);
            if (tx) {
                toast.success('Staked successfully Done 🥳 ', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
                setStakeBalance((stakeBalance)=>stakeBalance+ethers.utils.formatUnits(amountToString,8));
                 handleStakebalance();
                 handlCurrentApr();
                 handleShowRewardBalance();
                 handleEndDate();
                            
    }
}
            
        } catch (error) {        
           if (walletStatu) {
                toast.info('Metamask Transaction Rejected 🥶', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
            return
            }
            
           
    }
  }
}
    const handleStakebalance=async ()=>{
        try {
            StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
            const walletAddress = await signerOrProvider.getAddress();
            const checksumAddress = ethers.utils.getAddress(walletAddress);
            const stakeBalance = await StakingContractData._getUserStakedBalance(checksumAddress);
            console.log("bal",ethers.utils.formatUnits(stakeBalance,8));
            setStakeBalance(ethers.utils.formatUnits(stakeBalance,8))
        } catch (error) {
            console.log("error is on here on stakeBal",error)
        }
    }

    const handleUnstake=async(e)=>{
        e.preventDefault();
        if (!walletStatu) {
            HandleConnect();
            return
        }
        if (walletStatu) {
            try {
                StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
                const amounts= e.target.elements.amount.value;
                const amountToString= ethers.utils.parseUnits(amounts,8);
                if ( amountToString==0) {
                    toast.info("Amount should be greater than 0", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: 0,
                        theme: "dark",
                        transition: Bounce,
                    });
                    return
                }else if ( stakeBalance>=amountToString && amountToString>0) {
                    toast.info("Your don't have enough balance to unstake 🥵", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: 0,
                        theme: "dark",
                        transition: Bounce,
                    });
                    return
                }else{
                    const tx= await StakingContractData.UnStake(amountToString);
                const toastId = toast.loading("UnStaking in progress 🥵", {
                    position: "top-center",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: 0,
                    theme: "dark",
                    transition: Bounce,
                });
        
                await tx.wait();
                toast.dismiss(toastId);
                toast.success('UnStaked successfully Done 🥳', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
                setUnStakeBalance((UnStakeBalance)=>UnStakeBalance+ethers.utils.formatUnits(amountToString,8));
                console.log("Unstake is done 😄");
                 handleStakebalance();
                await handlCurrentApr();
                 handleStakebalance();
                await handleShowRewardBalance();
                }
        }
         catch (error) {
                toast.info('Metamask Transaction Rejected 🥶', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
            return 
        }
      }
    }
    const handleUnstakeBalance=async()=>{
        try {
            StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
            const walletAddress=await signerOrProvider.getAddress();
            const checksumAddress=ethers.utils.getAddress(walletAddress);
            const aprs=await StakingContractData.getUserUnStakedBalance(checksumAddress);
            setUnStakeBalance(ethers.utils.formatUnits(aprs,8));
        } catch (error) {
            console.log("error is on unstake balance");
        } 
    } 
    const handleClaimReward=async()=>{
        if (!walletStatu) {
            HandleConnect();
            return
        }
        if (walletStatu) {
        try {
            
            StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
            if (showReward==0) {
                toast.info('Reward amount should be greater than zero Check your reward', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                    });
                    return
            }else{
            const claimBal= await StakingContractData._Claim();
            const toastId = toast.loading("Claiming in processing... 🥵", {
                position: "top-center",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            });
    
            await claimBal.wait();
            toast.dismiss(toastId);
            toast.success('Claim successfull 🥳🥳🥳', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
            await handleShowRewardBalance();
            console.log("claim is done");
            }
        } catch (error) {
            toast.error('Metamask Transaction Rejected', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
        }
    }
    }
const handleTokenSymbole=async ()=>{
    try {
    tokenContractData = new ethers.Contract(tokenContract, tokenAbi, signerOrProvider);
    const symbol = await tokenContractData.symbol();
    setSymbole(symbol);
    } catch (error) {
        console.log("error is on symbole",error)
    }
}
handleTokenSymbole();
const handleApr = async (event) => {
    event.preventDefault();
}
const handlCurrentApr=async()=>{
    try {
        StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
        const walletAddress= await signerOrProvider.getAddress();
        const checksumAddress= ethers.utils.getAddress(walletAddress)
        const aprs=await StakingContractData.getUserCurrentApr(checksumAddress);
        setCurrentApr(ethers.utils.formatUnits(aprs,0));
    } catch (error) {
        console.log("error is on currentAPr");
    }
}

const handleButtonClick = (event) => {
    const selectedOption = event.target.value;
    let duration;
    if (selectedOption === '1') {
        duration = 7; 
    } else if (selectedOption === '3') {
        duration = 30;
    } else  {
        duration = 365;
    }
    setLockDuration(duration);
    setApr(selectedOption);
    toast.info(`${selectedOption}% Apr selected for ${duration} Days`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
    });
}
const handleTotalSupply=async()=>{
    try {
        StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
        const totalStakedSupply=await StakingContractData.TotalStaked();
        setTotalStake(ethers.utils.formatUnits(totalStakedSupply,8));
        
    } catch (error) {
        console.log("error is on totalSupply",error)
    }
}
handleTotalSupply();
const handleShowRewardBalance=async()=>{
    try {
        StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
        const walletAddress=await signerOrProvider.getAddress();
        const checksumAddress=ethers.utils.getAddress(walletAddress);
        const rewardBalance=await StakingContractData.getClaimRewardAmount(checksumAddress);
        console.log(ethers.utils.formatUnits(rewardBalance,8))
        setShowReward(ethers.utils.formatUnits(rewardBalance,8));
    } catch (error) {
        console.log("error is on show reward",error)
    }
}
const handleCompund=async()=>{
    if (!walletStatu) {
        HandleConnect();
        return
    }
    if (walletStatu) {
    try {
        StakingContractData = new ethers.Contract(stakingContract, stakingAbi, signerOrProvider);
        if (showReward==0) {
            toast.info('Reward amount should be greater than zero Check your reward', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
                return
        }else{
        const claimBal= await StakingContractData.compund();
        const toastId = toast.loading("Compound in processing... 🥵", {
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
            theme: "dark",
            transition: Bounce,
        });

        await claimBal.wait();
        toast.dismiss(toastId);
        toast.success('Compound Successfully Done 🥳🥳🥳', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
        await handleShowRewardBalance();
        }
    } catch (error) {
        toast.error('Transaction Rejected 🥶', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
    }
  }
}
const handleAutoAddReward=async()=>{
    if (!walletStatu) {
        HandleConnect();
        return
    }
    if (walletStatu) {
    try {
        StakingContractData= new ethers.Contract(stakingContract,stakingAbi,signerOrProvider);
        const tx=  await StakingContractData._CalculateAndAddReward();
        const toastId = toast.loading("Balance adding in processing... 🥵", {
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
            theme: "dark",
            transition: Bounce,
        });

        await tx.wait();
        toast.dismiss(toastId);
        toast.success('Balance added successfully 🥳🥳🥳', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
       await handleShowRewardBalance();
      
    } catch (error) {
        if (error.code === 4001) {
            toast.error('Transaction failed', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            });
        } else {
            toast.error("MetaMask Transaction Denied", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
                theme: "dark",
                transition: Bounce,
            });
        }
    }
 }
}
const handleEndDate=async ()=>{
    try {
    StakingContractData= new ethers.Contract(stakingContract,stakingAbi,signerOrProvider);
    const walletAddress= await signerOrProvider.getAddress();
    const checksumAddress= ethers.utils.getAddress(walletAddress);
    const getEndDate= await StakingContractData.getUserLockTime(checksumAddress);
    const milliseconds = getEndDate * 1000;
    const dateObject = new Date(milliseconds);
    setEndDate((dateObject).toLocaleString());
    } catch (error) {
        console.log(error);
    }
}
    

return (
        <div>
            <ToastContainer></ToastContainer>
           <div className='WalletAndNetwork'>
           <br />
           {
                    walletStatu?(<button onClick={handleSwicthChain} className='Button1'><b>{chainStatus}</b></button>):(<br></br>)
            }
           {
            !walletStatu?(<button onClick={HandleConnect} className='ConnectButton'><b>{walletAddress}</b></button>
        ):(<>
        <p className='WalletAddress'>{walletAddress}</p>
        <button onClick={handleDisconnect} className='disConnectButton'><b>Disconnect</b></button>
        </>)
            }
           <br /> <br />
            <p className='BalanceWallet'> <span>Available Balance : </span><b>{balance} {symbol}</b></p>
           </div>
           <div className='StakeAndUnstake'>
           <div className='handleApr'>
            <div className='AprStyle'>
            <b>Total Staked : {totalStake}</b><br /><br />
            <b>Apr  : </b> 
    
            </div>
                <form onSubmit={handleApr}>
                  <input type="button" value="1" onClick={handleButtonClick} />
                  <input type="button" value="3" onClick={handleButtonClick} />
                  <input type="button" value="30" onClick={handleButtonClick} />
               </form>
            </div>
                <div className='ControlStakeAndUnstake'>
                <form onSubmit={HandleStake}>
                     <input type="text" name="amount" placeholder='Enter your amount'/>
                     <button type='submit'>Deposit</button>
                </form>
                <div className='HandlUnstake'>
                  <form onSubmit={handleUnstake}>
                    <input type="text"  name="amount" placeholder='Enter your amount'/>
                    <button type='submit' >Withdraw</button>
                  </form>
                  </div>
                <div className='Note'>
                   <p>Note</p>
                   <p>Withdrawal before time limit attracts a 10% token deduction </p>
                </div>
                <div className='ClaimAndCompund'> 
                  <button type="button" onClick={handleClaimReward}>Claim</button>
                  <button type="button" onClick={handleCompund}>Compound</button>
    
                  </div>
                </div>
                <div className='ShowStakeAndUnstakDetails'>
                   <p><b> Staked Balance : </b>  <span>{stakeBalance} 🚀🚀🚀 </span></p>
                   <p><b> UnStake Balance  : </b> <span>{UnStakeBalance} 😔😔😔 </span> </p>
                   <p><b> Reward Balance : </b> <span>{showReward} 🔥🔥🔥 </span> </p>
                   <p><b> Your Current Apr  : </b> <span>{currentApr}% 🔥🔥🔥 </span> </p>
                   <p><b> Staking End Time  : </b> <span>{endDate}  </span> </p>
                </div>
                <div className='handleAutoReward'>
                    <button onClick={handleAutoAddReward}>Check your reward </button>
                </div>
           </div>
            
        </div>
    );
}

export default Wallet;