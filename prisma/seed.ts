import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { tagsData } from "./seed/tags";
import { postsData } from "./seed/posts";
import { projectsData } from "./seed/projects";
import { resumeContent } from "./seed/resume";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.create({
    data: {
      email: "admin@inkwell.dev",
      password: hashedPassword,
      name: "Alex Morgan",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", user.email);

  // Create tags
  const tagRecords = await Promise.all(
    tagsData.map((tag) =>
      prisma.tag.create({ data: tag })
    )
  );
  console.log(`Created ${tagRecords.length} tags`);

  // Build tag lookup by slug
  const tagMap = new Map(tagRecords.map((t) => [t.slug, t.id]));

  // Create posts
  for (const post of postsData) {
    const tagIds = post.tags
      .map((slug) => tagMap.get(slug))
      .filter((id): id is string => id !== undefined);

    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content.trim(),
        excerpt: post.excerpt,
        published: true,
        publishedAt: post.publishedAt,
        authorId: user.id,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }
  console.log(`Created ${postsData.length} posts`);

  // Create projects
  for (const project of projectsData) {
    await prisma.project.create({
      data: {
        title: project.title,
        slug: project.slug,
        description: project.description,
        content: project.content.trim(),
        techStack: project.techStack,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        featured: project.featured,
        sortOrder: project.sortOrder,
      },
    });
  }
  console.log(`Created ${projectsData.length} projects`);

  // Create resume
  await prisma.resume.create({
    data: { content: resumeContent.trim() },
  });
  console.log("Created resume");

  // Create site config
  await prisma.siteConfig.create({
    data: {
      siteName: "JP",
      siteDescription: "A developer portfolio showcasing projects, blog posts, and professional experience.",
      ownerName: "Alex Morgan",
      ownerTitle: "Senior Full-Stack Developer",
      ownerBio: "I build scalable web applications and cloud infrastructure. With 8+ years of experience shipping products used by millions, I write about software engineering, architecture, and the tools that make developers more productive.",
      githubUrl: "https://github.com/alexmorgan",
      linkedinUrl: "https://linkedin.com/in/alexmorgan",
      twitterUrl: "https://twitter.com/alexmorgan",
      email: "alex@example.com",
    },
  });
  console.log("Created site config");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
