import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin user and defaults...");

  // Create admin user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", user.email);
  } else {
    console.log("Admin user already exists:", existingUser.email);
  }

  // Create default SiteConfig if not exists
  const existingConfig = await prisma.siteConfig.findFirst();
  if (!existingConfig) {
    await prisma.siteConfig.create({
      data: {
        siteName: "JP",
        siteDescription: "A developer portfolio and blog",
        ownerName: "JP",
        ownerTitle: "Full-Stack Developer",
        ownerBio: "Full-Stack Developer specializing in serverless AWS architecture, React, and TypeScript. I build scalable web applications from cloud infrastructure to polished UI.",
        careerStartDate: new Date("2021-01-01"),
      },
    });
    console.log("Created default site config");
  } else {
    console.log("Site config already exists");
  }

  // Create empty Resume if not exists
  const existingResume = await prisma.resume.findFirst();
  if (!existingResume) {
    await prisma.resume.create({
      data: {
        content: "# Resume\n\nUpdate this content in the admin panel.",
      },
    });
    console.log("Created empty resume");
  } else {
    console.log("Resume already exists");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
