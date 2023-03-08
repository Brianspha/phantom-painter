//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

/**
 *@dev represents the function signatures to be implemented by the OneCanvas contract or any other contract
 */
interface IFantomPainter {
    /*==========================================================Event definition start==========================================================*/

    /*==========================================================Function definition start==========================================================*/

    /// @dev called when a user colors a pixel
    /// @param pixleIndex - The given pixel on the canvas
    /// @param pixelColor- The color of the pixel on the canvas
    /// @notice function doesnt return a value just emits a value using the **pixelColored** event
    function colorPixel(
        uint256 pixleIndex,
        string memory pixelColor
    ) external payable;

    /// @dev called when a pixel thats already owned is transferred to a new user
    /// @param canvasSize - The new canvas size
    /// @notice function doesnt return a value just emits a value using the **canvasSizeUpdated** event
    function updateCanvasSize(uint256 canvasSize) external;

    /// @notice returns all artist addresses
    /// @return Artist addresses
    function getArtistKeys() external view returns (address[] memory);

    /// @notice returns all pixel indexes as appears on the canvas
    /// @return Pixels indexes
    function getPixelIndexes() external view returns (uint256[] memory);

    /// @notice returns an artists details
    /// @param id The address of the artist to get information for
    /// @return Artist details (See structs)
    function getArtistDetails(address id) external view returns (uint256, uint256, bool);

    /// @notice returns a Pixel detail on the canvas
    /// @param pixelId The pixel index as appears on the canvas
    /// @return Pixel details
    function getPixelDetails(
        uint256 pixelId
    ) external view returns (uint256, bool, address, string memory);

}
