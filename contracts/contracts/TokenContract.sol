//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "./utils/errors/FantomPainterErrors.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import {ITablelandTables} from "@tableland/evm/contracts/ITablelandTables.sol";
import "./SQLHelpers.sol";

//@dev contract definition
contract TokenContract is
    ERC721URIStorageUpgradeable,
    ERC721HolderUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    /*==========================================================Variables definition start==========================================================*/
    mapping(uint256 => string) private _tokenURIs;
    ITablelandTables private _tableland;
    uint256 private _metadataTableId;
    string private _tablePrefix = "FantomPainter";
    string private _externalURL;
    string private _baseURIString;
    string private _metadataTable;
    address public fantomPainterAddress;

    /*==========================================================Modifiers definition start==========================================================*/

    modifier onlyFantomPainter() {
        require(
            msg.sender == fantomPainterAddress,
            "Only FantomPainter contract can make this call"
        );
        _;
    }

    /*==========================================================Functions definition start==========================================================*/

    //@dev function definitions
    constructor(
        string memory baseURI,
        string memory externalURL,
        address registry
    ) initializer {
        require(registry != address(0), "zero address");
        __ERC721URIStorage_init();
        __ERC721Holder_init();
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __ERC721_init("FantomPainter","MP");
        /*
         * The Tableland address on your current chain
         */
        _tableland = ITablelandTables(registry);
        _externalURL = externalURL;
        _baseURIString = baseURI;
        /*
         * Stores the unique ID for the newly created table.
         */
        _metadataTableId = _tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(
                _tablePrefix,
                "id int, external_link text, pixel_index text, owner text"
            )
        );

        _metadataTable = string.concat(
            _tablePrefix,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_metadataTableId)
        );
    }

    function setContractFantomPainterAddress(address fantomPainter)
        public
        onlyOwner
    {
        if(fantomPainter == address(0)){
            revert ZeroAddress();
        }
        fantomPainterAddress = fantomPainter;
    }

    function mintToken(address tokenOwner, uint256 pixelIndex)
        public
        onlyFantomPainter
        returns (uint256)
    {
        _tokenIds.increment();
        _tableland.runSQL(
            address(this),
            _metadataTableId,
            string.concat(
                "INSERT INTO ",
                _metadataTable,
                " (id, external_link, pixel_index,owner) VALUES (",
                Strings.toString(_tokenIds.current()),
                ", '",
                _externalURL,
                Strings.toString(pixelIndex),
                Strings.toHexString(tokenOwner),
                "')'"
            )
        );
        _safeMint(tokenOwner, pixelIndex, "");
        return _tokenIds.current();
    }

    function tokenExists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        // _tokenOwners are indexed by _tokenIds, so .length() returns the number of _tokenIds
        return _tokenIds.current();
    }

    function burnToken(uint256 tokenId)
        public
        onlyFantomPainter
        returns (bool)
    {
        _burn(tokenId);
        return tokenExists(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

    /*
     * tokenURI is an example of how to turn a row in your table back into
     * erc721 compliant metadata JSON. here, we do a simple SELECT statement
     * with function that converts the result into json.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721URIStorage: URI query for nonexistent token"
        );

        string memory base = _baseURI();

        /*
         * SELECT json_object('id',id,'external_link',external_link,'x',x,'y',y)
         *  as meta FROM canvas_5_4 WHERE id=11
         */
        return
            string.concat(
                base,
                "SELECT%20json_object(%27id%27,id,%27external_link%27,external_link,%27pixel_index%27,pixel_index,%27owner%27,owner)%20as%20meta%20FROM%20",
                _metadataTable,
                "%20WHERE%20id=",
                Strings.toString(tokenId),
                "&mode=list"
            );
    }

    /*
     * setExternalURL provides an example of how to update a field for every
     * row in an table.
     */
    function setExternalURL(string calldata externalURL) external onlyOwner {
        _externalURL = externalURL;
        _tableland.runSQL(
            address(this),
            _metadataTableId,
            string.concat(
                "update ",
                _metadataTable,
                " set external_link = ",
                externalURL,
                "||'?tokenId='||id", // Turns every row's URL into a URL including get param for tokenId
                ";"
            )
        );
    }

    /**
     * @dev See {UUPSUpgradeable-_authorizeUpgrade}.
     */
    function _authorizeUpgrade(address) internal view override onlyOwner {} // solhint-disable no-empty-blocks
}
