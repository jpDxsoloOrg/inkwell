import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const {
    siteName,
    siteDescription,
    ownerName,
    ownerTitle,
    ownerBio,
    avatarUrl,
    githubUrl,
    linkedinUrl,
    twitterUrl,
    email,
  } = body as {
    siteName?: string;
    siteDescription?: string;
    ownerName?: string;
    ownerTitle?: string;
    ownerBio?: string;
    avatarUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    email?: string;
  };

  const existing = await prisma.siteConfig.findFirst();

  let config;
  if (existing) {
    config = await prisma.siteConfig.update({
      where: { id: existing.id },
      data: {
        ...(siteName !== undefined && { siteName }),
        ...(siteDescription !== undefined && { siteDescription }),
        ...(ownerName !== undefined && { ownerName }),
        ...(ownerTitle !== undefined && { ownerTitle }),
        ...(ownerBio !== undefined && { ownerBio }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(twitterUrl !== undefined && { twitterUrl: twitterUrl || null }),
        ...(email !== undefined && { email: email || null }),
      },
    });
  } else {
    config = await prisma.siteConfig.create({
      data: {
        siteName: siteName ?? "JP",
        siteDescription: siteDescription ?? "",
        ownerName: ownerName ?? "",
        ownerTitle: ownerTitle ?? "",
        ownerBio: ownerBio ?? "",
        avatarUrl: avatarUrl || null,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        twitterUrl: twitterUrl || null,
        email: email || null,
      },
    });
  }

  return NextResponse.json(config);
}

export async function GET() {
  const config = await prisma.siteConfig.findFirst();
  return NextResponse.json(config);
}
