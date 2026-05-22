/* server/init.js
 ** You must write a script that will create documents in your database according
 ** to the datamodel you have defined for the application.  Remember that you
 ** must at least initialize an admin user account whose credentials are derived
 ** from command-line arguments passed to this script. But, you should also add
 ** some communities, posts, comments, and link-flairs to fill your application
 ** some initial content.  You can use the initializeDB.js script from PA03 as
 ** inspiration, but you cannot just copy and paste it--you script has to do more
 ** to handle the addition of users to the data model.
 */

// Usage: node init.js <adminEmail> <adminDisplayName> <adminPassword>

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const CommunityModel = require("./models/communities");
const PostModel = require("./models/posts");
const CommentModel = require("./models/comments");
const LinkFlairModel = require("./models/linkflairs");
const UserModel = require("./models/users");

const saltRounds = 10;
const userArgs = process.argv.slice(2);

if (!userArgs[0] || !userArgs[1] || !userArgs[2]) {
  console.log(
    "ERROR: Usage is node init.js <adminEmail> <adminDisplayName> <adminPassword>",
  );
  process.exit(1);
}

const [adminEmail, adminDisplayName, adminPassword] = userArgs;
const mongoDB = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phreddit";
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

function createLinkFlair(linkFlairObj) {
  return LinkFlairModel.create({
    content: linkFlairObj.content,
  });
}

function createComment(commentObj) {
  return CommentModel.create({
    content: commentObj.content,
    commentedBy: commentObj.commentedBy,
    commentedDate: commentObj.commentedDate,
    commentIDs: commentObj.commentIDs,
  });
}

function createPost(postObj) {
  return PostModel.create({
    title: postObj.title,
    content: postObj.content,
    postedBy: postObj.postedBy,
    postedDate: postObj.postedDate,
    views: postObj.views,
    linkFlairID: postObj.linkFlairID,
    commentIDs: postObj.commentIDs,
    upvotes: postObj.upvotes,
    downvotes: postObj.downvotes,
  });
}

function createCommunity(communityObj) {
  return CommunityModel.create({
    name: communityObj.name,
    description: communityObj.description,
    postIDs: communityObj.postIDs,
    startDate: communityObj.startDate,
    members: communityObj.members,
    createdBy: communityObj.createdBy,
  });
}

async function createUser(userObj) {
  const hashedPassword = await bcrypt.hash(userObj.password, saltRounds);

  return UserModel.create({
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    displayName: userObj.displayName,
    password: hashedPassword,
    reputation: userObj.reputation,
    isAdmin: userObj.isAdmin,
  });
}

async function clearDatabase() {
  await Promise.all([
    CommentModel.deleteMany({}),
    PostModel.deleteMany({}),
    CommunityModel.deleteMany({}),
    LinkFlairModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

async function initializeDB() {
  await clearDatabase();
  const adminUser = await createUser({
    firstName: "Admin",
    lastName: "User",
    email: adminEmail,
    displayName: adminDisplayName,
    password: adminPassword,
    reputation: 1000,
    isAdmin: true,
  });

  const defaultUsers = [
    {
      firstName: "Big",
      lastName: "Feet",
      email: "bigfeet@example.com",
      displayName: "bigfeet",
      password: "password",
    },
    {
      firstName: "Outtheretruth",
      lastName: "User",
      email: "outtheretruth47@example.com",
      displayName: "outtheretruth47",
      password: "password",
    },
    {
      firstName: "Astyanax",
      lastName: "User",
      email: "astyanax@example.com",
      displayName: "astyanax",
      password: "password",
    },
    {
      firstName: "Rollo",
      lastName: "User",
      email: "rollo@example.com",
      displayName: "rollo",
      password: "password",
    },
    {
      firstName: "Shemp",
      lastName: "User",
      email: "shemp@example.com",
      displayName: "shemp",
      password: "password",
    },
    {
      firstName: "Truck",
      lastName: "Nutz",
      email: "trucknutz69@example.com",
      displayName: "trucknutz69",
      password: "password",
    },
    {
      firstName: "Marco",
      lastName: "Arelius",
      email: "marcoarelius@example.com",
      displayName: "MarcoArelius",
      password: "password",
    },
    {
      firstName: "Cat",
      lastName: "Lady",
      email: "catlady13@example.com",
      displayName: "catlady13",
      password: "password",
    },
    {
      firstName: "Sunflower",
      lastName: "Beaches",
      email: "sunflowerbeaches@example.com",
      displayName: "sunflower-beaches",
      password: "password",
    },
    {
      firstName: "Eclipsed",
      lastName: "Yoshi",
      email: "eclipsedyoshi@example.com",
      displayName: "EclipsedYoshi",
      password: "password",
    },
    {
      firstName: "Lxc",
      lastName: "User",
      email: "lxc0313@example.com",
      displayName: "Lxc0313",
      password: "password",
    },
    {
      firstName: "Hail",
      lastName: "Conch",
      email: "hailthemagicconch@example.com",
      displayName: "hail-the-magic-conch",
      password: "password",
    },
  ];

  const userRefs = {};
  userRefs[adminDisplayName] = adminUser._id;

  for (const defaultUser of defaultUsers) {
    const createdUser = await createUser(defaultUser);
    userRefs[defaultUser.displayName] = createdUser._id;
  }

  const [linkFlairRef1, , linkFlairRef3] =
    await Promise.all([
      createLinkFlair({ content: "The jerkstore called..." }),
      createLinkFlair({ content: "Literal Saint" }),
      createLinkFlair({ content: "They walk among us" }),
      createLinkFlair({ content: "Worse than Hitler" }),
    ]);

  const commentRef10 = await createComment({
    content:
      "Wouldn't hurt to ask around the facilities in the SAC if anyone handed it in, but sadly there's a pretty good chance someone swiped it 😭 Rip Mr. Octopus 🙏",
    commentIDs: [],
    commentedBy: userRefs["hail-the-magic-conch"],
    commentedDate: new Date("April 30, 2026 22:10:00"),
  });

  const commentRef9 = await createComment({
    content: "Usagi!",
    commentIDs: [],
    commentedBy: userRefs.Lxc0313,
    commentedDate: new Date("April 30, 2026 22:13:00"),
  });

  const commentRef8 = await createComment({
    content: "mb. i ate the umbrella 🥀🥀🥀",
    commentIDs: [commentRef9],
    commentedBy: userRefs.EclipsedYoshi,
    commentedDate: new Date("April 30, 2026 22:05:00"),
  });

  const commentRef7 = await createComment({
    content: "Generic poster slogan #42",
    commentIDs: [],
    commentedBy: userRefs.bigfeet,
    commentedDate: new Date("September 10, 2024 09:43:00"),
  });

  const commentRef6 = await createComment({
    content: "I want to believe.",
    commentIDs: [commentRef7],
    commentedBy: userRefs.outtheretruth47,
    commentedDate: new Date("September 10, 2024 07:18:00"),
  });

  const commentRef5 = await createComment({
    content:
      "The same thing happened to me. I guest this channel does still show real history.",
    commentIDs: [],
    commentedBy: userRefs.bigfeet,
    commentedDate: new Date("September 09, 2024 17:03:00"),
  });

  const commentRef4 = await createComment({
    content: "The truth is out there.",
    commentIDs: [commentRef6],
    commentedBy: userRefs.astyanax,
    commentedDate: new Date("September 10, 2024 6:41:00"),
  });

  const commentRef3 = await createComment({
    content: "My brother in Christ, are you ok? Also, YTJ.",
    commentIDs: [],
    commentedBy: userRefs.rollo,
    commentedDate: new Date("August 23, 2024 09:31:00"),
  });

  const commentRef2 = await createComment({
    content:
      "Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.",
    commentIDs: [],
    commentedBy: userRefs.astyanax,
    commentedDate: new Date("August 23, 2024 10:57:00"),
  });

  const commentRef1 = await createComment({
    content:
      "There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.",
    commentIDs: [commentRef3],
    commentedBy: userRefs.shemp,
    commentedDate: new Date("August 23, 2024 08:22:00"),
  });

  const postRef1 = await createPost({
    title:
      "AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.",
    content:
      "Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?",
    linkFlairID: linkFlairRef1,
    postedBy: userRefs.trucknutz69,
    postedDate: new Date("August 23, 2024 01:19:00"),
    commentIDs: [commentRef1, commentRef2],
    views: 14,
  });

  const postRef2 = await createPost({
    title: "Remember when this was a HISTORY channel?",
    content:
      'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
    linkFlairID: linkFlairRef3,
    postedBy: userRefs.MarcoArelius,
    postedDate: new Date("September 9, 2024 14:24:00"),
    commentIDs: [commentRef4, commentRef5],
    views: 1023,
  });

  const postRef3 = await createPost({
    title: "umbrella thief 🌂",
    content:
      "Y'all I was in the women's bathroom by ballroom A & B and I forgot my umbrella there when I went to get Dunkin 😭\n\nRip Mr. Octopus, he gone 😔",
    postedBy: userRefs["sunflower-beaches"],
    postedDate: new Date("April 30, 2026 21:58:00"),
    commentIDs: [commentRef8, commentRef10],
    views: 3,
    upvotes: 11,
  });

  await createCommunity({
    name: "Am I the Jerk?",
    description: "A practical application of the principles of justice.",
    postIDs: [postRef1],
    startDate: new Date("August 10, 2014 04:18:00"),
    members: [
      userRefs.rollo,
      userRefs.shemp,
      userRefs.catlady13,
      userRefs.astyanax,
      userRefs.trucknutz69,
    ],
    createdBy: userRefs.rollo,
  });

  await createCommunity({
    name: "The History Channel",
    description: "A fantastical reimagining of our past and present.",
    postIDs: [postRef2],
    startDate: new Date("May 4, 2017 08:32:00"),
    members: [
      userRefs.MarcoArelius,
      userRefs.astyanax,
      userRefs.outtheretruth47,
      userRefs.bigfeet,
    ],
    createdBy: userRefs.MarcoArelius,
  });

  await createCommunity({
    name: "SBU",
    description:
      "A subreddit devoted to Stony Brook University students and alumni.",
    postIDs: [postRef3],
    startDate: new Date("January 11, 2011 11:43:00"),
    members: [userRefs["sunflower-beaches"]],
    createdBy: userRefs["sunflower-beaches"],
  });

  if (db) {
    db.close();
  }

  console.log("done");
}

initializeDB().catch((err) => {
  console.log(`ERROR: ${err}`);
  console.trace();
  if (db) {
    db.close();
  }
});

console.log("processing...");
