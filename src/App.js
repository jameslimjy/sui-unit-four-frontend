// React imports
import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";

// Sui imports
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

function App() {
  const MY_ADDRESS = "0x9887c164f425893ea0e5745da693fdce1867c0b1c2b3e3f8f26782baa846fe9e";
  const PACKAGE_ID = "0x4c6e0b896dadf67a278680f4c166a05a77022ac6b875866c5f2ab4d268206ad7";
  const RECIPIENT = "0x30a452b1a94b4f47e77e5bb5eb42f7bad2e78cd0fa0843d54712d467301db005";
  const MNEMONICS = "knife bundle love foam paper banner body hidden rough gate machine else";
  const MODULE_NAME = "marketplace";

  const [walletBalance, setWalletBalance] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("nil");
  const [widgetIds, setWidgetIds] = useState([""]);
  const [widgetToList, setWidgetToList] = useState("");
  const [price, setPrice] = useState("");
  const [listingIds, setListingIds] = useState([""]);
  const [itemIdToPurchase, setItemIdToPurchase] = useState("");
  const [listingInfo, setListingInfo] = useState("");

  const handleWidgetInput = (event) => {
    setWidgetToList(event.target.value);
  };

  const handlePriceInput = (event) => {
    setPrice(event.target.value);
  };

  const handleItemIdToPurchaseInput = (event) => {
    setItemIdToPurchase(event.target.value);
  };

  const getWalletBalance = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    const balance = (balance) => {
      return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
    };
    const suiBefore = await suiClient.getBalance({
      owner: MY_ADDRESS,
    });

    console.log(`SUI balance: ${balance(suiBefore)}`);
    const formattedBal = balance(suiBefore);
    setWalletBalance(formattedBal);
    console.log(formattedBal);
  };

  const getTokensFromFaucet = async () => {
    try {
      await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: MY_ADDRESS,
      });
      alert("Successfully requested tokens!");
    } catch (e) {
      alert("Failed to request tokens");
      console.log(e);
    }
  };

  const createNewWallet = async () => {
    try {
      // Generate a new Ed25519 Keypair
      const keypair = new Ed25519Keypair();
      const client = new SuiClient({
        url: getFullnodeUrl("testnet"),
      });

      console.log(keypair);
    } catch (e) {
      alert("Failed to create new wallet");
      console.log(e);
    }
  };

  const transferTokensToRecipient = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      const txb = new TransactionBlock();
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(250)]);
      // txb.transferObjects([coin], txb.pure(RECIPIENT));
      txb.transferObjects([coin], txb.pure(MY_ADDRESS));
      suiClient.signAndExecuteTransactionBlock({ signer: keypair, transactionBlock: txb });
      alert("Successfully transferred tokens to recipient!");
    } catch (e) {
      alert("Failed to transfer tokens to recipient");
      console.log(e);
    }
  };

  const callCreateMarketplace = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      // construct transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${PACKAGE_ID}::marketplace::create`,
        typeArguments: ["0x2::sui::SUI"],
      });

      // execute transaction block
      const result = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      // get results of transaction block
      const txn = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: false,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: false,
        },
      });

      // iterate through results to get object ID of created marketplace
      const txnObjectChanges = txn.objectChanges;

      for (let i = 0; i < txnObjectChanges.length; i++) {
        if (txnObjectChanges[i].type == "created") {
          setMarketplaceId(txnObjectChanges[i].objectId);
        }
      }
      alert("Succesfully created marketplace!");
    } catch (e) {
      alert("Failed to call createMarketplace");
      console.log(e);
    }
  };

  // NOT IN USE
  const getMarketplaceId = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    const createMarketplaceFilter = {
      MoveModule: { package: PACKAGE_ID, module: MODULE_NAME },
    };
    const createMarketplaceSub = await suiClient.subscribeEvent({
      filter: createMarketplaceFilter,
      onMessage(event) {
        // handle subcription message
        alert("marketplace created!");
        console.log("EVENT INFORMATION BELOW:");
        console.log(event);
      },
    });
  };

  const createWidgetItem = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      // construct transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${PACKAGE_ID}::widget::mint`,
      });

      // execute transaction block
      const result = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      // get results of transaction block
      const txn = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: false,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: false,
        },
      });

      // iterate through results to get object ID of created marketplace
      const txnObjectChanges = txn.objectChanges;

      for (let i = 0; i < txnObjectChanges.length; i++) {
        if (txnObjectChanges[i].type == "created") {
          console.log(txnObjectChanges[i]);
        }
      }
      alert("Succesfully created widget!");
    } catch (e) {
      alert("Failed to create widget item");
      console.log(e);
    }
  };

  const getOwnedWidgets = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const objects = await suiClient.getOwnedObjects({ owner: MY_ADDRESS });
      const widgets = [];

      // iterate through all objects owned by address
      for (let i = 0; i < objects.data.length; i++) {
        const currentObjectId = objects.data[i].data.objectId;

        // get object information
        const objectInfo = await suiClient.getObject({
          id: currentObjectId,
          options: { showContent: true },
        });

        if (objectInfo.data.content.type == `${PACKAGE_ID}::widget::Widget`) {
          const widgetObjectId = objectInfo.data.content.fields.id.id;
          console.log("widget spotted:", widgetObjectId);
          widgets.push(widgetObjectId);
        }
      }
      setWidgetIds(widgets);
      alert("Successfully refreshed!");
    } catch (e) {
      alert("Failed to refresh");
      console.log(e);
    }
  };

  const listItem = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      // construct transaction block
      const txb = new TransactionBlock();
      console.log(txb.object(marketplaceId));
      txb.moveCall({
        target: `${PACKAGE_ID}::marketplace::list`,
        typeArguments: [`${PACKAGE_ID}::widget::Widget`, "0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId), txb.object(widgetToList), txb.pure(price)],
      });

      // execute transaction block
      const result = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      console.log("Result of list item:");
      console.log(result);

      // get results of transaction block
      const txn = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: false,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: false,
        },
      });

      // console.log("txn info:");
      // console.log(txn);

      // iterate through results to get object ID of widget
      const txnObjectChanges = txn.objectChanges;
      console.log("txnObjectChanges info:");
      console.log(txnObjectChanges);

      for (let i = 0; i < txnObjectChanges.length; i++) {
        console.log(txnObjectChanges[i].objectType);
        if (txnObjectChanges[i].objectType.includes("Listing")) {
          console.log("listing object found: ", txnObjectChanges[i].objectId);
        }
      }

      alert("Successfully listed item");
    } catch (e) {
      alert("Failed to list item");
      console.log(e);
    }
  };

  const getMarketplaceItems = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

    // get marketplace ID
    const marketplaceObject = await suiClient.getObject({
      id: marketplaceId,
      options: { showContent: true },
    });
    const marketplaceItemsId = marketplaceObject.data.content.fields.items.fields.id.id;

    // get marketplace items ID
    const marketplaceItems = await suiClient.getDynamicFields({ parentId: marketplaceItemsId });

    const marketplaceListingIds = [];
    // get listing IDs - loop thru and save IDs using useState
    for (let i = 0; i < marketplaceItems.data.length; i++) {
      marketplaceListingIds.push(marketplaceItems.data[i].objectId);
    }

    setListingIds(marketplaceListingIds);
  };

  const getListingInformation = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
    const output = {};

    // iterate through all listings
    for (let i = 0; i < listingIds.length; i++) {
      const currentListing = {};
      const listingObject = await suiClient.getObject({
        id: listingIds[i],
        options: { showContent: true },
      });

      // console.log information
      console.log("objectId:", listingObject.data.content.fields.name);
      console.log("listingId:", listingIds[i]);
      console.log("askPrice:", listingObject.data.content.fields.value.fields.ask);
      console.log("owner:", listingObject.data.content.fields.value.fields.owner);

      // save relevant info into a dict
      output[listingObject.data.content.fields.name] = {
        listingId: listingIds[i],
        askPrice: listingObject.data.content.fields.value.fields.ask,
        owner: listingObject.data.content.fields.value.fields.owner,
      };
    }
    setListingInfo(output);
  };

  const purchaseListing = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      console.log("itemIdToPurchase:", itemIdToPurchase);

      // get ask price of item
      const askPrice = listingInfo[itemIdToPurchase]["askPrice"];
      console.log("askPrice:", askPrice);

      // split coin
      const txb = new TransactionBlock();
      // const [coin] = txb.splitCoins(txb.gas, [txb.pure(1000)]);
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(askPrice)]);

      // prepare transaction block
      txb.moveCall({
        target: `${PACKAGE_ID}::marketplace::buy_and_take`,
        typeArguments: [`${PACKAGE_ID}::widget::Widget`, "0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId), txb.pure(itemIdToPurchase), coin],
      });

      // execute transaction block
      const result = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      // get results of transaction block
      const txn = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: false,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: false,
        },
      });
      console.log("txn:");
      console.log(txn);
      alert("Succesfully purchased an item!");
    } catch (e) {
      console.log(e);
      alert("Failed to purchase listing");
    }
  };

  const takeProfits = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);

      // prepare transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${PACKAGE_ID}::marketplace::take_profits_and_keep`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId)],
      });

      // execute transaction block
      const result = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      // get results of transaction block
      const txn = await suiClient.getTransactionBlock({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: false,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: false,
        },
      });
      console.log("txn:");
      console.log(txn);
      alert("Succesfully took profits!");
    } catch (e) {
      console.log(e);
      alert("Failed to take profits");
    }
  };

  useEffect(() => {
    getWalletBalance();
    // getListings();
    // getMarketplaceId();
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* wallet balance: {getWalletBalance} */}
        <p>
          Currently selected wallet: {MY_ADDRESS}
          <br />
          Currently selected marketplace: {marketplaceId}
        </p>

        <button onClick={getTokensFromFaucet}>Get faucet tokens</button>
        <button onClick={createNewWallet}>Generate new wallet</button>
        <button onClick={transferTokensToRecipient}>Transfer tokens to 0x30a452b1a94b4f47e77e5bb5eb42f7bad2e78cd0fa0843d54712d467301db005</button>
        <button onClick={callCreateMarketplace}>Create marketplace</button>
        <button onClick={createWidgetItem}>Create widget</button>
        <button onClick={getOwnedWidgets}>Refreshed owned widgets</button>
        <p>Current wallet balance: {walletBalance}</p>

        <p>Currently owned widgets:</p>
        {widgetIds &&
          widgetIds.map((widget, idx) => {
            return <div>{widget}</div>;
          })}
        <div>
          <input type="text" value={widgetToList} onChange={handleWidgetInput} placeholder="input widgetId" />
          <input type="number" value={price} onChange={handlePriceInput} placeholder="input price" />
          <button onClick={listItem}>List Item</button>
        </div>
        <button onClick={getMarketplaceItems}>Get marketplace items</button>

        <p>Current listings:</p>
        {listingIds &&
          listingIds.map((listing, idx) => {
            return <div>{listing}</div>;
          })}
        <button onClick={getListingInformation}>Get listing info</button>
        <div>
          <input type="text" value={itemIdToPurchase} onChange={handleItemIdToPurchaseInput} placeholder="input itemId" />
          <button onClick={purchaseListing}>Purchase listing</button>
        </div>
        <button onClick={takeProfits}>Take Profits</button>
      </header>
    </div>
  );
}

export default App;
