describe("LumenToken", function() {
  let lumenToken: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function() {
    // Deploy the contract before each test
    const LumenTokenFactory = await ethers.getContractFactory("LumenToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    lumenToken = (await LumenTokenFactory.deploy(1000)) as LumenToken; // Initial supply is 1000 tokens
    await lumenToken.deployed();
  });

  describe("Deployment", function() {
    it("Should set the right owner", async function() {
      expect(await lumenToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the contract itself", async function() {
      const contractBalance = await lumenToken.balanceOf(lumenToken.address);
      expect(contractBalance).to.equal(ethers.utils.parseEther("1000"));
    });
  });

  describe("Token Distribution", function() {
    it("Should allow the owner to distribute tokens", async function() {
      await lumenToken.distribute(
        addr1.address,
        ethers.utils.parseEther("100"),
      );
      const addr1Balance = await lumenToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should fail if non-owner tries to distribute tokens", async function() {
      await expect(
        lumenToken
          .connect(addr1)
          .distribute(addr2.address, ethers.utils.parseEther("100")),
      ).to.be.revertedWith("Not the contract owner");
    });

    it("Should fail if contract has insufficient balance", async function() {
      await expect(
        lumenToken.distribute(addr1.address, ethers.utils.parseEther("2000")),
      ).to.be.revertedWith("Insufficient contract balance");
    });
  });

  describe("Token Transfers", function() {
    beforeEach(async function() {
      // Distribute some tokens to addr1 before testing transfers
      await lumenToken.distribute(
        addr1.address,
        ethers.utils.parseEther("100"),
      );
    });

    it("Should transfer tokens between accounts", async function() {
      await lumenToken
        .connect(addr1)
        .transfer(addr2.address, ethers.utils.parseEther("50"));
      const addr2Balance = await lumenToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should fail if sender has insufficient balance", async function() {
      await expect(
        lumenToken
          .connect(addr1)
          .transfer(addr2.address, ethers.utils.parseEther("200")),
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Allowance and TransferFrom", function() {
    beforeEach(async function() {
      await lumenToken.distribute(
        addr1.address,
        ethers.utils.parseEther("100"),
      );
    });

    it("Should approve allowance for another address", async function() {
      await lumenToken
        .connect(addr1)
        .approve(addr2.address, ethers.utils.parseEther("30"));
      const allowance = await lumenToken.allowance(
        addr1.address,
        addr2.address,
      );
      expect(allowance).to.equal(ethers.utils.parseEther("30"));
    });

    it("Should transfer tokens using transferFrom", async function() {
      await lumenToken
        .connect(addr1)
        .approve(addr2.address, ethers.utils.parseEther("30"));
      await lumenToken
        .connect(addr2)
        .transferFrom(
          addr1.address,
          addr2.address,
          ethers.utils.parseEther("20"),
        );

      const addr2Balance = await lumenToken.balanceOf(addr2.address);
      const addr1Balance = await lumenToken.balanceOf(addr1.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("20"));
      expect(addr1Balance).to.equal(ethers.utils.parseEther("80"));
    });

    it("Should fail if transferFrom exceeds allowance", async function() {
      await lumenToken
        .connect(addr1)
        .approve(addr2.address, ethers.utils.parseEther("30"));
      await expect(
        lumenToken
          .connect(addr2)
          .transferFrom(
            addr1.address,
            addr2.address,
            ethers.utils.parseEther("40"),
          ),
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Balance Check", function() {
    it("Should return the correct balance of an address", async function() {
      await lumenToken.distribute(
        addr1.address,
        ethers.utils.parseEther("100"),
      );
      const balance = await lumenToken.getHolderBalance(addr1.address);
      expect(balance).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should return zero balance for an address with no tokens", async function() {
      const balance = await lumenToken.getHolderBalance(addr2.address);
      expect(balance).to.equal(0);
    });
  });
});
