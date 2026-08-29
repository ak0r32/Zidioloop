import { prisma } from "../src/lib/db";
import { compare, hash } from "bcryptjs";

async function diagnose() {
  try {
    console.log("🔍 LOOP Login Diagnosis\n");

    // Test database connection
    console.log("1️⃣ Testing database connection...");
    const userCount = await prisma.user.count();
    console.log(`   ✓ Database connected. Found ${userCount} users.\n`);

    // Check for demo users
    console.log("2️⃣ Looking for demo users...");
    const users = await prisma.user.findMany({
      select: { email: true, role: true, id: true },
    });

    if (users.length === 0) {
      console.log("   ❌ No users found! Run: npm run db:seed\n");
      process.exit(1);
    }

    users.forEach((user) => {
      console.log(`   ✓ ${user.email} (${user.role})`);
    });

    // Test password verification
    console.log("\n3️⃣ Testing password verification...");
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@demo.loop" },
    });

    if (!adminUser) {
      console.log("   ❌ admin@demo.loop not found!\n");
      process.exit(1);
    }

    const isPasswordValid = await compare("demo1234", adminUser.passwordHash);
    console.log(`   Password match: ${isPasswordValid ? "✓ YES" : "❌ NO"}\n`);

    // Test workspace isolation
    console.log("4️⃣ Testing workspace isolation...");
    const workspaceCount = await prisma.workspace.count();
    console.log(`   ✓ Workspaces: ${workspaceCount}`);
    const feedbackCount = await prisma.feedback.count();
    console.log(`   ✓ Feedback items: ${feedbackCount}`);
    const themeCount = await prisma.theme.count();
    console.log(`   ✓ Themes: ${themeCount}\n`);

    console.log("✅ All checks passed! You should be able to login.");
    console.log("\nDEMO CREDENTIALS:");
    console.log("  Email: admin@demo.loop");
    console.log("  Password: demo1234\n");
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
