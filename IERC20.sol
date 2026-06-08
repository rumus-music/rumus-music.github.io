```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(
        address to,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(
        address account
    ) external view returns (uint256);
}

contract MultiChainReceiver {

    // =====================================
    // OWNER
    // =====================================

    address public owner;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Not owner"
        );
        _;
    }

    // =====================================
    // SETTINGS
    // =====================================

    uint256 public targetETH;

    // =====================================
    // MULTI CHAIN ADDRESSES
    // =====================================

    string public solana =
        "CB4xnv7Mw23eJkbRBXvbLUDUDQVQsg5AUvfY5nu8Ny5W";

    string public btc =
        "bc1qfwn7lfntn5jyl9yxgcrnhu4gaz8w5mnua0acyt";

    string public doge =
        "DSTbQeqpCajXu8BYmririjJ8b8Lx92Lvov";

    string public ltc =
        "ltc1qz7ccrlkkv5qxrmlenr67jtqe3dy5k5w09sznvf";

    string public fio =
        "FIO67SRBSYY42urrjvN11AWuuTWHQzo47jH8LE1nrthe48EBxDo9e";

    string public icp =
        "8a92cb3db92beacc8982e1425c3c25b8f80381249d77ce19bf66c306d8727053";

    string public iotx =
        "io1p7ej7yufhsc7fwqv5vngde5llse00a4zsrs83w";

    string public zil =
        "zil1de4766z0f9mm9psyflk3tcrxc562cw068y863d";

    string public egld =
        "erd1rgznaj8fvvy6jq80xyvnzjk0amv5t63l9vm276r0kf939gjy2p0sfakxj8";

    string public osmo =
        "osmo148ds6u09ywv0d2zswjdcp0h9krs7f8eaf60gw5";

    string public flux =
        "t1LKNhr6hitag9QwTk7sGgBnwyyQYxFqMbv";

    string public juno =
        "juno148ds6u09ywv0d2zswjdcp0h9krs7f8eahnlrl6";

    string public firo =
        "aE7PmZpWuW7aXBqCXhpGmaF2XLSYert4DR";

    string public xrp =
        "rUT9m6CoZqdNWKFm7q2zo8Htsy1cvfSuk";

    // =====================================
    // EVENTS
    // =====================================

    event ETHReceived(
        address indexed from,
        uint256 amount
    );

    event TokenReceived(
        address indexed token,
        address indexed from,
        uint256 amount
    );

    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    // =====================================
    // CONSTRUCTOR
    // =====================================

    constructor(
        uint256 _targetETH
    ) {
        owner = msg.sender;
        targetETH = _targetETH;
    }

    // =====================================
    // RECEIVE ETH
    // =====================================

    receive() external payable {
        emit ETHReceived(
            msg.sender,
            msg.value
        );
    }

    // =====================================
    // TOKEN DEPOSIT
    // =====================================

    function depositToken(
        address token,
        uint256 amount
    ) external {

        bool success =
            IERC20(token).transferFrom(
                msg.sender,
                address(this),
                amount
            );

        require(
            success,
            "Transfer failed"
        );

        emit TokenReceived(
            token,
            msg.sender,
            amount
        );
    }

    // =====================================
    // VIEWS
    // =====================================

    function contractETHBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    function tokenBalance(
        address token
    )
        external
        view
        returns (uint256)
    {
        return IERC20(token)
            .balanceOf(address(this));
    }

    // =====================================
    // OWNER SETTINGS
    // =====================================

    function setTargetETH(
        uint256 newTarget
    )
        external
        onlyOwner
    {
        targetETH = newTarget;
    }

    function transferOwnership(
        address newOwner
    )
        external
        onlyOwner
    {
        require(
            newOwner != address(0),
            "Zero address"
        );

        emit OwnershipTransferred(
            owner,
            newOwner
        );

        owner = newOwner;
    }

    // =====================================
    // WITHDRAW ETH
    // =====================================

    function withdrawETH()
        external
        onlyOwner
    {
        uint256 amount =
            address(this).balance;

        (bool success,) =
            payable(owner).call{
                value: amount
            }("");

        require(
            success,
            "ETH withdraw failed"
        );
    }

    // =====================================
    // WITHDRAW TOKEN
    // =====================================

    function withdrawToken(
        address token
    )
        external
        onlyOwner
    {
        IERC20 erc20 =
            IERC20(token);

        uint256 balance =
            erc20.balanceOf(
                address(this)
            );

        require(
            erc20.transfer(
                owner,
                balance
            ),
            "Token withdraw failed"
        );
    }
}
```
