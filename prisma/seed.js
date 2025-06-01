const fs = require('fs');
const csv = require('csv-parser');
// const stripBomStream = require('strip-bom-stream');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { title } = require('process');
const prisma = new PrismaClient();

function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(path.join(__dirname, filePath))
            // .pipe(stripBomStream())
            .pipe(csv())
            .on('data', (data) => {
                // console.log('data:', JSON.stringify(data));
                results.push(data)
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    // Read data from CSV files
    let topics = await readCSV('topics.csv');
    let questions = await readCSV('questions.csv');

    topics = topics.map(t => {
        return {
            id: Object.values(t)[0],
            title: Object.values(t)[1],
        };
    })

    questions = questions.map(q => {
        return {
            title: q.title,
            topicId: q.topicId,
        };
    })

    // console.log('topics:', topics);
    // console.log('questions:', questions);
    // return;

    // await prisma.$executeRaw`TRUNCATE TABLE "topics" RESTART IDENTITY`;
    // await prisma.$executeRaw`TRUNCATE TABLE "questions" RESTART IDENTITY`;
    // await prisma.$executeRawUnsafe(`TRUNCATE TABLE "topics" RESTART IDENTITY CASCADE`);

   
    // Insert topics
    await prisma.topic.createMany({
        data: topics,
        skipDuplicates: true
    });
    // await Promise.all(
    //     topics.map(topic =>
    //         prisma.topic.upsert({
    //             where: { title: topic.title },
    //             update: {},
    //             create: topic,
    //         })
    //     )
    // );

    // Insert qusetions
    await prisma.question.createMany({
        data: questions,
        skipDuplicates: true,
    });

    // await Promise.all(
    //     questions.map(question =>
    //         prisma.topic.upsert({
    //             where: { title: question.title },
    //             update: {},
    //             create: question,
    //         })
    //     )
    // );

       // Insert user
    // Insert user
    // await prisma.user.create({
    //     data: {
    //         name: 'admin',
    //         email: 'admin@example.com',
    //         password: 'password', 
    //         role: 'ADMIN', // or 'ADMIN'
    //         isVerified: true
    //     },
    // });

    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'admin',
            email: 'admin@example.com',
            password: 'password',
            role: 'ADMIN', // or 'ADMIN'
            isVerified: true
        },
    });

    console.log('All data seeded successfully');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
