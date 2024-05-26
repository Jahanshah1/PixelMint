import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const contractAddress = '0x528268f80fe98669d712f524aa4a66141218bbc5'; // Replace with your contract address

const fetchNFTData = async (tokenId) => {
    if (!window.ethereum) {
        throw new Error('MetaMask is required to use this feature.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const tokenURI = await contract.tokenURI(tokenId);
    const owner = await contract.ownerOf(tokenId);

    return { tokenURI, owner };
};

const fetchMetadata = async (tokenURI) => {
    const response = await fetch(tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'));
    const metadata = await response.json();
    return metadata;
};

const Marketplace = () => {
    const [nftData, setNftData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const tokenId = 1; // Replace with the token ID you want to display

    useEffect(() => {
        const loadNFTData = async () => {
            try {
                const { tokenURI, owner } = await fetchNFTData(tokenId);
                const metadata = await fetchMetadata(tokenURI);
                setNftData({ ...metadata, owner });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch NFT data.');
                setLoading(false);
            }
        };

        loadNFTData();
    }, [tokenId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Marketplace</h1>
            {nftData && (
                <div className="nft-card">
                    <img src={nftData.image} alt={nftData.name} />
                    <h2>{nftData.name}</h2>
                    <p>{nftData.description}</p>
                    <p>Owner: {nftData.owner}</p>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
