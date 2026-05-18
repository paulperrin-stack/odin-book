require('dotenv').config();

const { PrismaClient, FollowStatus } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing data...');

    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    console.log('Creating users...');

    const usernames = new Set();
    const usersData = [];

    const passwordHash = await bcrypt.hash('seedpass', 10);

    for (let i = 0; i < 20; i++) {
        let username;

        do {
            username = faker.internet.username().toLowerCase();
        } while (usernames.has(username));

        usernames.add(username);

        const githubUser = Math.random() < 0.4;

        usersData.push({
            email: faker.internet.email().toLowerCase(),
            username,
            displayName: faker.person.fullName(),
            avatarUrl: faker.image.avatar(),
            passwordHash: githubUser ? null : passwordHash,
            githubId: githubUser ? faker.string.uuid() : null,
        });
    }

    await prisma.user.createMany({
        data: usersData,
    });

    const users = await prisma.user.findMany();

    console.log(`Created ${users.length} users`);

    console.log('Creating posts...');

    const postsData = [];

    for (let i = 0; i < 50; i++) {
        const author = faker.helpers.arrayElement(users);

        postsData.push({
            content: faker.lorem.sentence(),
            authorId: author.id,
        });
    }

    await prisma.post.createMany({
        data: postsData,
    });

    const posts = await prisma.post.findMany();

    console.log(`Created ${posts.length} posts`);

    console.log('Creating follows...');

    const followsData = [];
    const followPairs = new Set();

    for (const user of users) {
        const followCount = faker.number.int({
            min: 3,
            max: 7,
        });

        let created = 0;

        while (created < followCount) {
            const target = faker.helpers.arrayElement(users);

            if (target.id === user.id) continue;

            const key = `${user.id}-${target.id}`;

            if (followPairs.has(key)) continue;

            followPairs.add(key);

            followsData.push({
                followerId: user.id,
                followingId: target.id,
                status:
                    Math.random() < 0.7
                        ? FollowStatus.ACCEPTED
                        : FollowStatus.PENDING,
            });

            created++;
        }
    }

    await prisma.follow.createMany({
        data: followsData,
    });

    const follows = await prisma.follow.findMany();

    console.log(`Created ${follows.length} follows`);

    console.log('Creating likes...');

    const likesData = [];
    const likePairs = new Set();

    for (const post of posts) {
        const likesCount = faker.number.int({
            min: 0,
            max: 5,
        });

        let created = 0;

        while (created < likesCount) {
            const user = faker.helpers.arrayElement(users);

            const key = `${user.id}-${post.id}`;

            if (likePairs.has(key)) continue;

            likePairs.add(key);

            likesData.push({
                userId: user.id,
                postId: post.id,
            });

            created++;
        }
    }

    await prisma.like.createMany({
        data: likesData,
    });

    const likes = await prisma.like.findMany();

    console.log(`Created ${likes.length} likes`);

    console.log('Creating comments...');

    const commentsData = [];

    for (const post of posts) {
        const commentsCount = faker.number.int({
            min: 0,
            max: 4,
        });

        for (let i = 0; i < commentsCount; i++) {
            const author = faker.helpers.arrayElement(users);

            commentsData.push({
                content: faker.lorem.sentence(),
                authorId: author.id,
                postId: post.id,
            });
        }
    }

    await prisma.comment.createMany({
        data: commentsData,
    });

    const comments = await prisma.comment.findMany();

    console.log(`Created ${comments.length} comments`);

    console.log('Seed complete');
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });