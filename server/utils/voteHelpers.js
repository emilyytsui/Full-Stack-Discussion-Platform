function getVoteDelta(voteType) {
  return voteType === "upvote"
    ? { countField: "upvotes", reputation: 5 }
    : { countField: "downvotes", reputation: -10 };
}

function applyVote(content, owner, voterID, voteType) {
  const voterIDString = String(voterID);

  if (!Array.isArray(content.votes)) {
    content.votes = [];
  }

  const voteIndex = content.votes.findIndex(
    (vote) => String(vote.user) === voterIDString,
  );

  const existingVote = voteIndex >= 0 ? content.votes[voteIndex] : null;

  if (existingVote?.voteType === voteType) {
    const { countField, reputation } = getVoteDelta(voteType);
    content[countField] = Math.max(0, (content[countField] ?? 0) - 1);
    owner.reputation -= reputation;
    content.votes.splice(voteIndex, 1);
  } else {
    if (existingVote) {
      const oldVote = getVoteDelta(existingVote.voteType);
      content[oldVote.countField] = Math.max(
        0,
        (content[oldVote.countField] ?? 0) - 1,
      );
      owner.reputation -= oldVote.reputation;
      existingVote.voteType = voteType;
    } else {
      content.votes.push({ user: voterID, voteType });
    }

    const newVote = getVoteDelta(voteType);
    content[newVote.countField] = (content[newVote.countField] ?? 0) + 1;
    owner.reputation += newVote.reputation;
  }

  content.votedBy = content.votes.map((vote) => vote.user);
}

module.exports = {
  applyVote,
};
