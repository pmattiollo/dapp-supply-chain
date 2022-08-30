// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain');

contract('SupplyChain', function(accounts) {
    const State = {
        Harvested: 0,
        Processed: 1,
        Packed: 2,
        ForSale: 3,
        Sold: 4,
        Shipped: 5,
        Received: 6,
        Purchased: 7
    };

    let sku = 1;
    let upc = 1;
    const ownerID = accounts[0];
    const originFarmerID = accounts[1];
    const originFarmName = "John Doe";
    const originFarmInformation = "Yarray Valley";
    const originFarmLatitude = "-38.239770";
    const originFarmLongitude = "144.341490";
    let productID = sku + upc;
    const productNotes = "Best beans for Espresso";
    const productPrice = web3.utils.toWei(".01", "ether");
    const distributorID = accounts[2];
    const retailerID = accounts[3];
    const consumerID = accounts[4];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", accounts[0]);
    console.log("Farmer: accounts[1] ", accounts[1]);
    console.log("Distributor: accounts[2] ", accounts[2]);
    console.log("Retailer: accounts[3] ", accounts[3]);
    console.log("Consumer: accounts[4] ", accounts[4]);

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        await supplyChain.addFarmer(originFarmerID);

        // Declare and Initialize a variable for event and watch the emitted event Harvested()
        let eventEmitted = false;
        supplyChain.contract.once("Harvested", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: originFarmerID
        });

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(
            expectedItem.itemUPC,
            expectedItem.originFarmerID,
            expectedItem.originFarmName,
            expectedItem.originFarmInformation,
            expectedItem.originFarmLatitude,
            expectedItem.originFarmLongitude,
            expectedItem.productNotes,
            { from: expectedItem.originFarmerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event and watch the emitted event Processed()
        let eventEmitted = false;
        supplyChain.contract.once("Processed", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: originFarmerID,
            state: State.Processed
        });

        // Mark an item as Processed by calling function processItem()
        await supplyChain.processItem(expectedItem.itemUPC, { from: originFarmerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event and watch the emitted event Packed()
        let eventEmitted = false;
        supplyChain.contract.once("Packed", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: originFarmerID,
            state: State.Packed
        });

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(expectedItem.itemUPC, { from: originFarmerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event and watch the emitted event ForSale()
        let eventEmitted = false;
        supplyChain.contract.once("ForSale", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: originFarmerID,
            state: State.ForSale
        });

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(expectedItem.itemUPC, expectedItem.productPrice, { from: expectedItem.originFarmerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        await supplyChain.addDistributor(distributorID);

        // Declare and Initialize a variable for event and watch the emitted event Sold()
        let eventEmitted = false;
        supplyChain.contract.once("Sold", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: distributorID,
            distributor: distributorID,
            state: State.Sold
        });

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(expectedItem.itemUPC, { from: expectedItem.distributorID, value: expectedItem.productPrice });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event and watch the emitted event Shipped()
        let eventEmitted = false;
        supplyChain.contract.once("Shipped", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: distributorID,
            distributor: distributorID,
            state: State.Shipped
        });

        // Mark an item as Shipped by calling function shipItem()
        await supplyChain.shipItem(expectedItem.itemUPC, { from: expectedItem.distributorID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed();
        await supplyChain.addRetailer(retailerID);

        // Declare and Initialize a variable for event and watch the emitted event Received()
        let eventEmitted = false;
        supplyChain.contract.once("Received", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: retailerID,
            distributor: distributorID,
            retailer: retailerID,
            state: State.Received
        });

        // Mark an item as Received by calling function receiveItem()
        await supplyChain.receiveItem(expectedItem.itemUPC, { from: expectedItem.retailerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        await supplyChain.addConsumer(consumerID);

        // Declare and Initialize a variable for event and watch the emitted event Purchased()
        let eventEmitted = false;
        supplyChain.contract.once("Purchased", () => eventEmitted = true);

        // Build an item
        const expectedItem = buildItem({
            owner: consumerID,
            distributor: distributorID,
            retailer: retailerID,
            consumer: consumerID,
            state: State.Purchased
        });

        // Mark an item as Sold by calling function purchaseItem()
        await supplyChain.purchaseItem(expectedItem.itemUPC, { from: expectedItem.consumerID });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, expectedItem.itemUPC);

        // Verify the result set
        assertEquals(item, expectedItem);
        assertEventEmitted(eventEmitted);
    });

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() and fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Build an item
        const expectedItem = buildItem({
            owner: consumerID,
            distributor: distributorID,
            retailer: retailerID,
            consumer: consumerID,
            state: State.Purchased
        });

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const item = await fetchItem(supplyChain, upc);

        // Verify the result set:
        assertEquals(item, expectedItem);
    });

    function buildItem({
        owner = ownerID,
        farmer = originFarmerID,
        distributor = emptyAddress,
        retailer = emptyAddress,
        consumer = emptyAddress,
        state = State.Harvested
    } = {}) {
        return {
            itemSKU: sku,
            itemUPC: upc,
            ownerID: owner,
            originFarmerID: farmer,
            originFarmName: originFarmName,
            originFarmInformation: originFarmInformation,
            originFarmLatitude: originFarmLatitude,
            originFarmLongitude: originFarmLongitude,
            productID: productID,
            productNotes: productNotes,
            productPrice: productPrice,
            itemState: state,
            distributorID: distributor,
            retailerID: retailer,
            consumerID: consumer
        };
    }

    async function fetchItem(supplyChain, upc, fromAccount = ownerID) {
        const bufferOne = await supplyChain.fetchItemBufferOne.call(upc, { from: fromAccount });
        const bufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, { from: fromAccount });

        return {
            itemSKU: bufferOne[0],
            itemUPC: bufferOne[1],
            ownerID: bufferOne[2],
            originFarmerID: bufferOne[3],
            originFarmName: bufferOne[4],
            originFarmInformation: bufferOne[5],
            originFarmLatitude: bufferOne[6],
            originFarmLongitude: bufferOne[7],

            productID: bufferTwo[2],
            productNotes: bufferTwo[3],
            productPrice: bufferTwo[4],
            itemState: bufferTwo[5],
            distributorID: bufferTwo[6],
            retailerID: bufferTwo[7],
            consumerID: bufferTwo[8]
        };
    }

    function assertEquals(item, expectedItem) {
        assert.equal(item.itemSKU, expectedItem.itemSKU, 'Error: Invalid item SKU');
        assert.equal(item.itemUPC, expectedItem.itemUPC, 'Error: Invalid item UPC');
        assert.equal(item.ownerID, expectedItem.ownerID, 'Error: Missing or Invalid ownerID');
        assert.equal(item.originFarmerID, expectedItem.originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(item.originFarmName, expectedItem.originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(item.originFarmInformation, expectedItem.originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(item.originFarmLatitude, expectedItem.originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(item.originFarmLongitude, expectedItem.originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
        assert.equal(item.itemState, expectedItem.itemState, 'Error: Invalid item State');
        assert.equal(item.distributorID, expectedItem.distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(item.retailerID, expectedItem.retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(item.consumerID, expectedItem.consumerID, 'Error: Missing or Invalid consumerID');
    }

    function assertEventEmitted(emitted, expected = true) {
        assert.equal(emitted, expected, 'Invalid event emitted');
    }

    async function watchEvent(event, callback) {
        return event.watch(callback);
    }
});

