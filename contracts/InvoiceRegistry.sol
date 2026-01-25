// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvoiceRegistry {
    event InvoiceCertified(bytes32 indexed invoiceHash, address indexed issuer, uint256 timestamp);

    struct Certification {
        address issuer;
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(bytes32 => Certification) public certifications;

    function certify(bytes32 invoiceHash) external {
        require(certifications[invoiceHash].timestamp == 0, "Invoice already certified");

        certifications[invoiceHash] = Certification({
            issuer: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        emit InvoiceCertified(invoiceHash, msg.sender, block.timestamp);
    }

    function verify(bytes32 invoiceHash) external view returns (bool, address, uint256) {
        Certification memory cert = certifications[invoiceHash];
        if (cert.timestamp == 0) {
            return (false, address(0), 0);
        }
        return (true, cert.issuer, cert.timestamp);
    }
}
