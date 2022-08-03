// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "hardhat/console.sol";

contract Door {
    error UnknownWitness();
    error OutRangeAttestation();
    error DuplicatedVote();
    error NothingToClaim();
    error WrongSource();

    enum XChainCommitType {
        createAccount,
        transferAsset
    }

    // event FundEvent(address indexed source, uint256 amount);

    // destination chain event, step 0, prepare to transfer
    event XChainClaimIdEvent(bytes source, uint32 indexed claimId);

    // source chain event, initiate transfer or account create
    event XChainCommitEvent(
        XChainCommitType eventType,
        uint32 indexed claimId,
        uint256 amount,
        uint256 sigReward,
        address source,
        bytes destination
    );

    // destination chain event, transfer or account create gets quorum
    event XChainCompleteEvent(
        XChainCommitType eventType,
        uint32 indexed claimId,
        uint256 amount,
        uint256 sigReward,
        bytes destination
    );

    // destination door, an incomming tx for transfer or account create
    struct InboundXChainTx {
        bytes source;
        bool hasQuorum;
        uint256 electedIndex;
        InboundXChainTxVote[] votes;
    }

    // destination door, votes from witnesses on the same data of a tx
    struct InboundXChainTxVote {
        uint256 amount;
        uint256 sigReward;
        address payable dest;
        address payable[] witnesses;
    }

    uint32 previousClaimId = 0; // destination chain. first claimId = 1
    uint32 XChainCreateAccountSourceSqn = 1;
    uint32 XChainCreateAccountDestMin = 1;
    uint32 XChainCreateAccountDestMax = 1;
    uint32 quorum;
    uint256 public reserve;
    // both doors must use the same config, i.e. *Min
    uint256 immutable transferMin;
    uint256 immutable accountCreateMin;
    uint256 immutable sigRewardMin;
    /* otherDoor must be use in production */
    //bytes otherDoor;

    /* witnesses update logic must be added in production */
    address payable[] witnesses;
    mapping(address => uint256) unclaimed;
    mapping(uint32 => InboundXChainTx) onFlyTxns;
    mapping(uint32 => InboundXChainTx) onFlyAccountTxns;

    constructor(
        uint32 quorum_,
        uint256 transferMin_,
        uint256 accountCreateMin_,
        uint256 sigRewardMin_,
        address payable[] memory initWitnesses_
    ) payable {
        require(quorum_ >= 1);
        quorum = quorum_;
        reserve = msg.value;
        transferMin = transferMin_;
        accountCreateMin = accountCreateMin_;
        sigRewardMin = sigRewardMin_;
        //otherDoor = https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
        witnesses = initWitnesses_;
        // for (uint256 i = 0; i < witnesses.length; i++) {
        //     console.log("witness: %s", witnesses[i]);
        // }
    }

    // only owner can add reserve??
    function addReserve() external payable {
        reserve += msg.value;
        // emit FundEvent(msg.sender, msg.value);
    }

    function XChainClaimIdCreate(bytes calldata source_)
        external
        returns (uint32)
    {
        if (bytes(source_).length == 0) revert WrongSource();
        InboundXChainTx storage itx = onFlyTxns[++previousClaimId];
        itx.source = source_;
        emit XChainClaimIdEvent(itx.source, previousClaimId);
        return previousClaimId;
    }

    function XChainCommit(
        uint32 claimId_,
        uint256 sigReward_,
        bytes calldata dest_
    ) external payable {
        require(msg.value >= transferMin);
        require(sigReward_ >= sigRewardMin);

        emit XChainCommitEvent(
            XChainCommitType.transferAsset,
            claimId_,
            msg.value,
            sigReward_,
            msg.sender,
            dest_
        );
        reserve += msg.value;
    }

    function XChainCreateAccountCommit(uint256 sigReward_, bytes calldata dest_)
        external
        payable
    {
        require(msg.value >= accountCreateMin);
        require(sigReward_ >= sigRewardMin);
        emit XChainCommitEvent(
            XChainCommitType.createAccount,
            XChainCreateAccountSourceSqn++,
            msg.value,
            sigReward_,
            msg.sender,
            dest_
        );
        reserve += msg.value;
    }

    function isWitness(address payable[] storage witnesses_, address a)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < witnesses_.length; i++) {
            if (witnesses_[i] == a) return true;
        }
        return false;
    }

    function comparebytess(bytes memory a, bytes memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function pay(uint32 sqn_) private {
        InboundXChainTx storage itxPtr = onFlyTxns[sqn_];
        assert(itxPtr.hasQuorum);
        InboundXChainTxVote storage votePtr = itxPtr.votes[itxPtr.electedIndex];
        console.log(
            "Door::pay sqn=%s, gonna pay %s %s",
            sqn_,
            votePtr.dest,
            votePtr.amount
        );
        if (!votePtr.dest.send(votePtr.amount)) {
            unclaimed[votePtr.dest] += votePtr.amount;
        }
        uint256 perWitness = votePtr.sigReward / quorum;
        for (uint256 j = 0; j < votePtr.witnesses.length; j++) {
            if (!votePtr.witnesses[j].send(perWitness)) {
                unclaimed[votePtr.witnesses[j]] += perWitness;
            }
        }
    }

    function XChainAddTransferAttestation(
        uint32 sqn_,
        uint256 amount_,
        uint256 sigReward_,
        address payable dest_,
        bytes memory source_
    ) public payable {
        if (!isWitness(witnesses, msg.sender)) revert UnknownWitness();

        if (bytes(onFlyTxns[sqn_].source).length == 0)
            revert OutRangeAttestation();

        if (!comparebytess(source_, onFlyTxns[sqn_].source))
            revert WrongSource();

        InboundXChainTx storage itxPtr = onFlyTxns[sqn_];

        if (itxPtr.hasQuorum) revert OutRangeAttestation();

        for (uint256 i = 0; i < itxPtr.votes.length; ++i) {
            InboundXChainTxVote storage vote = itxPtr.votes[i];
            if (isWitness(vote.witnesses, msg.sender)) revert DuplicatedVote();

            if (
                vote.amount == amount_ &&
                vote.sigReward == sigReward_ &&
                vote.dest == dest_
            ) {
                if (vote.witnesses.length >= quorum)
                    revert OutRangeAttestation();

                vote.witnesses.push(payable(msg.sender));
                console.log(
                    "XChainAddTransferAttestation adding more vote. %s:%s",
                    itxPtr.votes.length,
                    vote.witnesses.length
                );
                if (vote.witnesses.length == quorum) {
                    itxPtr.hasQuorum = true;
                    itxPtr.electedIndex = i;
                    pay(sqn_);
                }
                return;
            }
            // else {
            //     console.log(
            //         "XChainAddTransferAttestation mismatch vote, %s:%s",
            //         vote.amount,
            //         amount_
            //     );
            //     console.log(
            //         "XChainAddTransferAttestation mismatch vote, %s:%s",
            //         vote.sigReward,
            //         sigReward_
            //     );
            //     console.log(
            //         "XChainAddTransferAttestation mismatch vote, %s:%s",
            //         vote.dest,
            //         dest_
            //     );
            // }
        }

        InboundXChainTxVote storage newVote = itxPtr.votes.push();
        newVote.amount = amount_;
        newVote.sigReward = sigReward_;
        newVote.dest = dest_;
        newVote.witnesses.push(payable(msg.sender));
        console.log(
            "XChainAddTransferAttestation adding different vote, %s:%s, %s",
            itxPtr.votes.length,
            newVote.witnesses.length,
            newVote.sigReward
        );

        if (quorum == 1) {
            itxPtr.hasQuorum = true;
            assert(itxPtr.votes.length == 1);
            pay(sqn_);
        }
    }

    function createAccounts() private {
        for (
            uint32 i = XChainCreateAccountDestMin;
            i < XChainCreateAccountDestMax;
            i++
        ) {
            InboundXChainTx storage itxPtr = onFlyAccountTxns[i];
            if (itxPtr.hasQuorum) {
                InboundXChainTxVote storage votePtr = itxPtr.votes[
                    itxPtr.electedIndex
                ];
                if (!votePtr.dest.send(votePtr.amount)) {
                    unclaimed[votePtr.dest] += votePtr.amount;
                }
                uint256 perWitness = votePtr.sigReward / quorum;
                for (uint256 j = 0; j < votePtr.witnesses.length; j++) {
                    if (!votePtr.witnesses[j].send(perWitness)) {
                        unclaimed[votePtr.witnesses[j]] += perWitness;
                    }
                }
            } else {
                return;
            }
        }
    }

    function XChainAddCreateAccountAttestation(
        uint32 sqn_,
        uint256 amount_,
        uint256 sigReward_,
        address payable dest_
    ) public payable {
        if (!isWitness(witnesses, msg.sender)) revert UnknownWitness();

        if (
            sqn_ < XChainCreateAccountDestMin ||
            sqn_ > XChainCreateAccountDestMax
        ) revert OutRangeAttestation();

        InboundXChainTx storage itxPtr = onFlyAccountTxns[sqn_];

        if (itxPtr.hasQuorum) revert OutRangeAttestation();

        for (uint256 i = 0; i < itxPtr.votes.length; ++i) {
            InboundXChainTxVote storage vote = itxPtr.votes[i];
            if (isWitness(vote.witnesses, msg.sender)) revert DuplicatedVote();

            if (
                vote.amount == amount_ &&
                vote.sigReward == sigReward_ &&
                vote.dest == dest_
            ) {
                if (vote.witnesses.length >= quorum)
                    revert OutRangeAttestation();

                vote.witnesses.push(payable(msg.sender));
                if (vote.witnesses.length == quorum) {
                    itxPtr.hasQuorum = true;
                    itxPtr.electedIndex = i;
                    createAccounts();
                }
                return;
            }
        }

        InboundXChainTxVote storage newVote = itxPtr.votes.push();
        newVote.amount = amount_;
        newVote.sigReward = sigReward_;
        newVote.dest = dest_;
        newVote.witnesses.push(payable(msg.sender));
        if (quorum == 1) {
            itxPtr.hasQuorum = true;
            assert(itxPtr.votes.length == 1);
            createAccounts();
        }

        if (sqn_ == XChainCreateAccountDestMax) XChainCreateAccountDestMax++;
    }

    // if sender owns an existing claimId, claim the asset if at the right status
    // TODO won't be used yet
    function claim(address payable dest) public payable {
        if (unclaimed[msg.sender] == 0) revert NothingToClaim();
        if (dest.send(unclaimed[msg.sender])) {
            unclaimed[msg.sender] = 0;
        }
    }
}
