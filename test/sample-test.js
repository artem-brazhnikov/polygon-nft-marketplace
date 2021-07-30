/* test/sample-test.js */
describe("NFTMarket", function() {
  it("Should create and execute market sales", async function() {
    /* deploy the marketplace */
    const Market = await ethers.getContractFactory("NFTMarketplace")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    /* deploy the NFT contract */
    const NFT = await ethers.getContractFactory("NFTItem")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    await nft.setApprovalForAll(marketAddress, true);

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* create two tokens */
    await nft.createItem("https://www.mytokenlocation.com")
    await nft.createItem("https://www.mytokenlocation2.com")
  
    /* put both tokens for sale */
    await market.listNFTItem(nftContractAddress, 0, auctionPrice, { value: listingPrice })
    await market.listNFTItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
    
    const [_, buyerAddress] = await ethers.getSigners()
  
    /* execute sale of token to another user */
    await market.connect(buyerAddress).buyNFTItem(0, { value: auctionPrice})

    /* query for and return the unsold items */
    let items = await market.getMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})