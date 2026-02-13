// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * - Only admin (owner) can anchor document hashes
 * - Anyone can approve an anchored document
 * - Uses docHash (bytes32) as the canonical identifier on-chain
 */
contract DocumentRegistry is Ownable {
    struct AnchorInfo {
        address anchoredBy;
        uint64 anchoredAt;
        bool exists;
    }

    // docHash => anchor info
    mapping(bytes32 => AnchorInfo) private _anchors;

    // docHash => user => approved?
    mapping(bytes32 => mapping(address => bool)) private _approved;

    event DocumentAnchored(
        bytes32 indexed docHash,
        address indexed anchoredBy,
        uint64 anchoredAt
    );
    event DocumentApproved(
        bytes32 indexed docHash,
        address indexed user,
        uint64 approvedAt
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Anchor (admin only) ---

    function anchorDocument(bytes32 docHash) external onlyOwner {
        require(docHash != bytes32(0), "Invalid docHash");
        require(!_anchors[docHash].exists, "Already anchored");

        _anchors[docHash] = AnchorInfo({
            anchoredBy: msg.sender,
            anchoredAt: uint64(block.timestamp),
            exists: true
        });

        emit DocumentAnchored(docHash, msg.sender, uint64(block.timestamp));
    }

    // --- Approve (any user) ---
    function approveDocument(bytes32 docHash) external {
        require(_anchors[docHash].exists, "Not anchored");
        require(!_approved[docHash][msg.sender], "Already approved");

        _approved[docHash][msg.sender] = true;
        emit DocumentApproved(docHash, msg.sender, uint64(block.timestamp));
    }

    // --- Views ---
    function isAnchored(bytes32 docHash) external view returns (bool) {
        return _anchors[docHash].exists;
    }

    function anchorInfo(
        bytes32 docHash
    )
        external
        view
        returns (bool exists, address anchoredBy, uint64 anchoredAt)
    {
        AnchorInfo memory a = _anchors[docHash];
        return (a.exists, a.anchoredBy, a.anchoredAt);
    }

    function isApproved(
        bytes32 docHash,
        address user
    ) external view returns (bool) {
        return _approved[docHash][user];
    }
}
