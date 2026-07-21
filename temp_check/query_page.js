const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const pages = await prisma.page.findMany({
      take: 20,
      select: {
        id: true,
        slug: true,
        status: true,
        title: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    console.log(JSON.stringify(pages, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
