// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentPass — on-chain credential passport for Agent ID (.ai) holders
/// @notice Badges are reputation only: no token, no monetary return, no fee,
///         no custody, no owner/admin/pause. Every write function requires the
///         caller to hold an Agent ID (balanceOf > 0 on the SPACE ID Agent ID
///         ERC-721 contract, 0x60b9262456de011f7d15a54cdd8c48baaa8b022f).
/// @dev Badge IDs: 1 = DAILY, 2 = MARK, 3 = TIPPER, 4 = BUILDER, 5 = EARLY.
///      Check-in day is the UTC day: block.timestamp / 86400.
interface IAgentId {
    function balanceOf(address owner) external view returns (uint256);
}

contract AgentPass {
    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    /// @notice The SPACE ID Agent ID contract (ERC-721, non-transferable).
    IAgentId public immutable agentId;

    uint8 public constant BADGE_DAILY = 1;
    uint8 public constant BADGE_MARK = 2;
    uint8 public constant BADGE_TIPPER = 3;
    uint8 public constant BADGE_BUILDER = 4;
    uint8 public constant BADGE_EARLY = 5;

    /// @notice Maximum message length for leaveMark (characters, ASCII).
    uint256 public constant MAX_MARK_LENGTH = 280;

    /// @notice Cap on unique badge holders eligible for the EARLY badge.
    uint256 public constant EARLY_CAP = 100;

    /// @notice Seconds in a UTC day; used to derive the check-in day.
    uint256 public constant DAY_SECONDS = 86400;

    // ------------------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------------------

    /// @notice holder => badge id => earned?
    mapping(address => mapping(uint8 => bool)) private _hasBadge;

    /// @notice holder => number of distinct badges earned (for totalHolders).
    mapping(address => uint256) private _badgeCount;

    /// @notice Number of unique addresses holding at least one badge.
    uint256 private _totalHolders;

    /// @notice Total check-ins across all holders.
    uint256 private _totalCheckIns;

    /// @notice holder => UTC day number of the last check-in.
    mapping(address => uint256) public lastCheckInDay;

    /// @notice holder => current consecutive-day streak.
    mapping(address => uint256) public streak;

    /// @notice holder => lifetime check-ins.
    mapping(address => uint256) public totalCheckInsOf;

    /// @notice holder => last public message (overwritten on each new mark).
    mapping(address => string) public lastMark;

    /// @notice holder => number of marks left.
    mapping(address => uint256) public marksOf;

    /// @notice holder => tips sent (count).
    mapping(address => uint256) public tipsSent;

    /// @notice holder => tips received (count).
    mapping(address => uint256) public tipsReceived;

    /// @notice holder => contract address claimed for the BUILDER badge.
    mapping(address => address) public builderContract;

    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------

    event CheckIn(address indexed who, uint256 streak, uint256 day);
    event Mark(address indexed who, string message);
    event Tip(address indexed from, address indexed to, uint256 amount);
    event BuilderClaimed(address indexed who, address indexed contractAddr);
    event EarlyClaimed(address indexed who);
    event BadgeAwarded(address indexed who, uint8 indexed badge);

    // ------------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------------

    error NotAgentIdHolder();
    error AlreadyCheckedInToday();
    error MessageTooLong();
    error TipToNonHolder();
    error ZeroTip();
    error TipFailed();
    error AlreadyClaimed();
    error ZeroAddress();
    error EarlyCapReached();

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    /// @param agentId_ Address of the Agent ID ERC-721 contract.
    constructor(address agentId_) {
        if (agentId_ == address(0)) revert ZeroAddress();
        agentId = IAgentId(agentId_);
    }

    // ------------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------------

    /// @dev Reverts unless the caller holds at least one Agent ID.
    modifier onlyAgentIdHolder() {
        if (agentId.balanceOf(msg.sender) == 0) revert NotAgentIdHolder();
        _;
    }

    // ------------------------------------------------------------------------
    // Write functions
    // ------------------------------------------------------------------------

    /// @notice Daily check-in. One per UTC day. Streak increments when the
    ///         previous check-in was yesterday, otherwise resets to 1.
    ///         Awards the DAILY badge on the first ever check-in.
    function checkIn() external onlyAgentIdHolder {
        uint256 day = block.timestamp / DAY_SECONDS;
        if (lastCheckInDay[msg.sender] == day) revert AlreadyCheckedInToday();

        if (lastCheckInDay[msg.sender] == day - 1) {
            streak[msg.sender] += 1;
        } else {
            streak[msg.sender] = 1;
        }
        lastCheckInDay[msg.sender] = day;
        totalCheckInsOf[msg.sender] += 1;
        _totalCheckIns += 1;

        _awardBadge(msg.sender, BADGE_DAILY);

        emit CheckIn(msg.sender, streak[msg.sender], day);
    }

    /// @notice Leave a public signed message (max 280 characters).
    ///         Only the latest message is stored on-chain; history lives in
    ///         the Mark events. Awards the MARK badge the first time.
    /// @param message The message text (max 280 bytes).
    function leaveMark(string calldata message) external onlyAgentIdHolder {
        if (bytes(message).length > MAX_MARK_LENGTH) revert MessageTooLong();

        lastMark[msg.sender] = message;
        marksOf[msg.sender] += 1;

        _awardBadge(msg.sender, BADGE_MARK);

        emit Mark(msg.sender, message);
    }

    /// @notice Tip another Agent ID holder. The FULL msg.value is forwarded
    ///         to `to` in the same call — no fee, no custody, no escrow.
    ///         Awards the TIPPER badge the first time.
    /// @param to Recipient, must hold an Agent ID.
    function tip(address to) external payable onlyAgentIdHolder {
        if (to == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroTip();
        if (agentId.balanceOf(to) == 0) revert TipToNonHolder();

        tipsSent[msg.sender] += 1;
        tipsReceived[to] += 1;

        _awardBadge(msg.sender, BADGE_TIPPER);

        (bool ok, ) = to.call{value: msg.value}("");
        if (!ok) revert TipFailed();

        emit Tip(msg.sender, to, msg.value);
    }

    /// @notice Claim the BUILDER badge by registering a contract the caller
    ///         deployed. One claim per agent; the recorded address cannot be
    ///         changed. NOTE: verification that the contract source is
    ///         verified on BscScan is done by the FRONTEND (BscScan API)
    ///         BEFORE sending this transaction — this contract only records
    ///         the claim and cannot check BscScan itself.
    /// @param contractAddr Address of the deployed contract.
    function claimBuilder(address contractAddr) external onlyAgentIdHolder {
        if (contractAddr == address(0)) revert ZeroAddress();
        if (_hasBadge[msg.sender][BADGE_BUILDER]) revert AlreadyClaimed();

        builderContract[msg.sender] = contractAddr;

        _awardBadge(msg.sender, BADGE_BUILDER);

        emit BuilderClaimed(msg.sender, contractAddr);
    }

    /// @notice Claim the EARLY badge. Only available while fewer than 100
    ///         unique addresses hold any badge.
    function claimEarly() external onlyAgentIdHolder {
        if (_totalHolders >= EARLY_CAP) revert EarlyCapReached();
        if (_hasBadge[msg.sender][BADGE_EARLY]) revert AlreadyClaimed();

        _awardBadge(msg.sender, BADGE_EARLY);

        emit EarlyClaimed(msg.sender);
    }

    // ------------------------------------------------------------------------
    // Views
    // ------------------------------------------------------------------------

    /// @notice True if `who` holds badge `badge` (1..5).
    function hasBadge(address who, uint8 badge) external view returns (bool) {
        return _hasBadge[who][badge];
    }

    /// @notice All five badges of `who`, in order [DAILY, MARK, TIPPER,
    ///         BUILDER, EARLY].
    function badgesOf(address who) external view returns (bool[5] memory) {
        return [
            _hasBadge[who][BADGE_DAILY],
            _hasBadge[who][BADGE_MARK],
            _hasBadge[who][BADGE_TIPPER],
            _hasBadge[who][BADGE_BUILDER],
            _hasBadge[who][BADGE_EARLY]
        ];
    }

    /// @notice Full public profile of `who`.
    /// @return streak_ Current check-in streak.
    /// @return totalCheckIns_ Lifetime check-ins.
    /// @return marks_ Number of marks left.
    /// @return tipsSent_ Number of tips sent.
    /// @return tipsReceived_ Number of tips received.
    function profile(address who)
        external
        view
        returns (
            uint256 streak_,
            uint256 totalCheckIns_,
            uint256 marks_,
            uint256 tipsSent_,
            uint256 tipsReceived_
        )
    {
        return (
            streak[who],
            totalCheckInsOf[who],
            marksOf[who],
            tipsSent[who],
            tipsReceived[who]
        );
    }

    /// @notice Number of unique addresses holding at least one badge.
    function totalHolders() external view returns (uint256) {
        return _totalHolders;
    }

    /// @notice Total check-ins across all holders.
    function totalCheckIns() external view returns (uint256) {
        return _totalCheckIns;
    }

    // ------------------------------------------------------------------------
    // Internal
    // ------------------------------------------------------------------------

    /// @dev Awards `badge` to `who` if not already held. The first badge a
    ///      holder ever earns increments the unique-holder counter.
    function _awardBadge(address who, uint8 badge) internal {
        if (_hasBadge[who][badge]) return;
        _hasBadge[who][badge] = true;
        if (_badgeCount[who] == 0) {
            _totalHolders += 1;
        }
        _badgeCount[who] += 1;
        emit BadgeAwarded(who, badge);
    }
}
