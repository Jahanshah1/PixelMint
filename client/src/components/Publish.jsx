import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create } from '@web3-storage/w3up-client';

const Publish = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [metadataURI, setMetadataURI] = useState('');
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState('');
    const [tokenId, setTokenId] = useState(null);
    const [tokenURI, setTokenURI] = useState('');
    const [owner, setOwner] = useState('');
    const [client, setClient] = useState(null);

    useEffect(() => {
        const initializeClient = async () => {
            try {
                const clientInstance = await create();
                setClient(clientInstance);
            } catch (err) {
                console.error('Error initializing Web3.Storage client:', err);
            }
        };
        initializeClient();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok) {
                setImageUrl(data.image_url);

                // Upload to Web3.Storage
                if (!client) {
                    setError('Web3.Storage client is not initialized.');
                    return;
                }

                // Fetch the image data
                const imgResponse = await fetch(data.image_url);
                const blob = await imgResponse.blob();
                const file = new File([blob], 'generated_image.png', { type: 'image/png' });

                // Upload the image to Web3.Storage
                const cid = await client.uploadFile(file);
                setMetadataURI(`ipfs://${cid}`);
                console.log(`Image uploaded to IPFS with CID: ${cid}`);

                setError(null);
            } else {
                setError(data.error);
                setImageUrl(null);
            }
        } catch (error) {
            setError('An error occurred while generating the image.');
            setImageUrl(null);
        }
    };

    const handleNFTise = async () => {
        if (!window.ethereum) {
            alert('MetaMask is required to use this feature.');
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();

            const contractAddress = '0x528268f80fe98669d712f524aa4a66141218bbc5';
            const contractABI = [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "recipient",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "tokenURI",
                            "type": "string"
                        }
                    ],
                    "name": "createNFT",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "nonpayable",
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

            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const recipientAddress = await signer.getAddress();
            const tx = await contract.createNFT(recipientAddress, metadataURI);

            setTxHash(tx.hash);
            console.log(`Transaction hash: ${tx.hash}`);

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            const mintedTokenId = receipt.events[0].args.tokenId.toNumber();

            // Fetch and display the token URI and owner
            const mintedTokenURI = await contract.tokenURI(mintedTokenId);
            const tokenOwner = await contract.ownerOf(mintedTokenId);

            setTokenId(mintedTokenId);
            setTokenURI(mintedTokenURI);
            setOwner(tokenOwner);

            console.log(`Token ID: ${mintedTokenId}`);
            console.log(`Token URI: ${mintedTokenURI}`);
            console.log(`Owner: ${tokenOwner}`);

        } catch (err) {
            console.error('Error creating NFT:', err);
            setError('An error occurred while creating the NFT.');
        }
    };

    return (
        <div>
            <h1>Generate Image with DALL-E</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="prompt">Enter Prompt:</label>
                <input
                    type="text"
                    id="prompt"
                    name="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />
                <button type="submit">Generate</button>
            </form>
            {imageUrl && (
                <div>
                    <h2>Generated Image:</h2>
                    <img src={imageUrl} alt="Generated" />
                </div>
            )}
            {error && <p>{error}</p>}
            <div>
                <button onClick={() => window.location.reload()}>Re-generate</button>
                <button className='text-white'onClick={handleNFTise}>NFTise</button>
            </div>
            {txHash && (
                <div>
                    <h2>Transaction Hash:</h2>
                    <p>{txHash}</p>
                </div>
            )}
            {tokenId !== null && (
                <div>
                    <h2>Minted Token Details:</h2>
                    <p>Token ID: {tokenId}</p>
                    <p>Token URI: {tokenURI}</p>
                    <p>Owner: {owner}</p>
                </div>
            )}
        </div>
    );
};

export default Publish;
