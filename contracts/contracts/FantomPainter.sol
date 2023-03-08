//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "./interfaces/IFantomPainter.sol";
import "./TokenContract.sol";
import "./SafeMathV2.sol";
import "./utils/structs/FantomPainterStructs.sol";
import "./utils/errors/FantomPainterErrors.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
*@dev contract represents the functionality required by OneCanvas 
*@notice mostly likey not optimised for gas will fix as i develop
*@notice implements the IOneCanvas interface 

 */
contract FantomPainter is
    IFantomPainter,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    IERC721Receiver
{
    using SafeMathV2 for uint256;
    /*==========================================================Events definition start==========================================================*/

    event PixelColored(
        address indexed owner,
        uint256 indexed pixelId,
        uint256 indexed cost
    );

    event TransferPixelOwnerShip(
        address indexed owner,
        uint256 indexed pixelId,
        uint256 tokenIndex
    );

    event CanvasSizeUpdated(uint256 indexed oldSize, uint256 indexed newSize);

    /*==========================================================Variable definition start==========================================================*/
    uint256 public transactionFees = 0;
    uint256 public canvasMaxPixels = 1295;
    uint256 public minPaintCost = 0.05 ether;
    uint256 public maxCoolDown = 1 days;
    TokenContract pixel;
    address[] pixelOwners;
    uint256[] pixels;
    mapping(uint256 => Pixel) currentPixels;
    mapping(address => Artist) artists;

    /*==========================================================Function definition start==========================================================*/
    constructor(address tokenAddress) initializer {
        if (tokenAddress == address(0)) {
            revert ZeroAddress();
        }
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        pixel = TokenContract(tokenAddress);
    }

    function colorPixel(
        uint256 pixelIndex,
        string memory pixelColor
    ) public payable virtual override nonReentrant {
        Pixel storage tempPixel = currentPixels[pixelIndex];
        Artist storage tempArtist = artists[msg.sender];
        require(!tempPixel.occupied, "Pixel occupied");
        require(
            block.timestamp >= tempArtist.coolDownTimer,
            "Cooldown time hasnt expired"
        );
        require(
            msg.sender != owner(),
            "Contract owner not allowed to color pixel"
        );
        require(
            pixelIndex >= 0 && pixelIndex <= canvasMaxPixels,
            "Invalid pixel index"
        );
        require((bytes(pixelColor)).length > 0, "Invalid pixel color");
        require(
            msg.value > 0 && msg.value >= minPaintCost,
            "Cost must be equal to  or greater than 0 and min paint cost"
        );
        if (msg.sender == tempPixel.owner) {
            revert AlreadyOwner();
        }

        pixels.push(pixelIndex);
        tempPixel.pixelIndex = pixelIndex;
        tempPixel.pixelIndex = pixelIndex;
        tempPixel.occupied = true;
        tempPixel.owner = msg.sender;
        tempPixel.color = pixelColor;
        if (!tempArtist.active) {
            tempArtist.id = payable(msg.sender);
            tempArtist.coloredPixels = 1;
            tempArtist.active = true;
            pixelOwners.push(msg.sender);
        } else {
            tempArtist.coloredPixels++;
        }
        uint256 tokenId = pixel.mintToken(msg.sender, pixelIndex);
        tempArtist.coolDownTimer = block.timestamp + maxCoolDown;
        tempPixel.tokenId = tokenId;
        emit TransferPixelOwnerShip(msg.sender, pixelIndex, tokenId);
    }

    function updateCanvasSize(
        uint256 canvasSize
    ) public virtual override onlyOwner {
        require(
            canvasSize > canvasMaxPixels || canvasSize < canvasMaxPixels,
            "Cannot update canvas size with same size"
        );
        canvasMaxPixels = canvasSize;
    }

    function getPixelDetails(
        uint256 pixelIndex
    )
        public
        view
        virtual
        override
        returns (uint256, bool, address, string memory)
    {
        return (
            currentPixels[pixelIndex].tokenId,
            currentPixels[pixelIndex].occupied,
            currentPixels[pixelIndex].owner,
            currentPixels[pixelIndex].color
        );
    }

    function getArtistKeys()
        public
        view
        virtual
        override
        returns (address[] memory)
    {
        return pixelOwners;
    }

    function getArtistDetails(
        address artist
    ) public view virtual override returns (uint256, uint256, bool) {
        return (
            artists[artist].coloredPixels,
            artists[artist].coolDownTimer,
            artists[artist].active
        );
    }

    function getPixelIndexes()
        public
        view
        virtual
        override
        returns (uint256[] memory)
    {
        return pixels;
    }

    receive() external payable {}

    /**
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
