import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const feedbackSamples = [
  {
    content: "Payment processing is extremely slow during peak hours. We lose customers.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Payment Issues", "Performance"],
  },
  {
    content: "Your onboarding flow is intuitive and guided. Great first impression!",
    channel: "Chat",
    sentiment: "POS",
    themes: ["Onboarding", "UX"],
  },
  {
    content: "API documentation is outdated. Many examples don't work with current version.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Documentation", "API"],
  },
  {
    content: "Checkout flow is smooth. Converted immediately.",
    channel: "NPS Survey",
    sentiment: "POS",
    themes: ["Checkout", "Conversion"],
  },
  {
    content: "Support response times are getting worse. 24 hours for a critical issue?",
    channel: "Chat",
    sentiment: "NEG",
    themes: ["Support", "Response Time"],
  },
  {
    content: "Dashboard is beautiful and intuitive. Love the dark mode.",
    channel: "Twitter",
    sentiment: "POS",
    themes: ["UI/UX", "Dashboard"],
  },
  {
    content: "Card validation error message is confusing. Tried 5 times before contacting support.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Payment Issues", "Error Messages"],
  },
  {
    content: "Bulk export feature saved us hours of manual work. Excellent addition!",
    channel: "ProductHunt",
    sentiment: "POS",
    themes: ["Features", "Productivity"],
  },
  {
    content: "Mobile app crashes when uploading large CSV files.",
    channel: "App Store",
    sentiment: "NEG",
    themes: ["Mobile", "CSV", "Bug"],
  },
  {
    content: "Your team's responsiveness is incredible. Feature request implemented in 2 weeks!",
    channel: "Email",
    sentiment: "POS",
    themes: ["Support", "Roadmap"],
  },
  {
    content: "Signup required too much information. Abandoned after 3 fields.",
    channel: "Analytics",
    sentiment: "NEG",
    themes: ["Signup", "Friction"],
  },
  {
    content: "Integration with Slack works perfectly. Saved our team so much time.",
    channel: "Slack",
    sentiment: "POS",
    themes: ["Integrations", "Slack"],
  },
  {
    content: "Pricing is reasonable for the value we get.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Pricing"],
  },
  {
    content: "Billing invoice formatting is inconsistent. Tax calculation was wrong.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Billing", "Tax"],
  },
  {
    content: "Real-time notifications keep our team perfectly informed.",
    channel: "Chat",
    sentiment: "POS",
    themes: ["Notifications", "Team"],
  },
  {
    content: "Database performance is declining. Queries that took 2s now take 8s.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Performance", "Infrastructure"],
  },
  {
    content: "Loved the new analytics features. They're game-changers for our team.",
    channel: "NPS Survey",
    sentiment: "POS",
    themes: ["Analytics"],
  },
  {
    content: "SSL certificate error appeared in production. We couldn't access our account.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Security", "Downtime"],
  },
  {
    content: "Your educational content library is comprehensive and well-structured.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Education", "Content"],
  },
  {
    content: "Competitor's feature parity makes us consider switching.",
    channel: "Email",
    sentiment: "NEU",
    themes: ["Competition"],
  },
  {
    content: "Multi-currency support is exactly what our international team needed.",
    channel: "Slack",
    sentiment: "POS",
    themes: ["Internationalization", "Features"],
  },
  {
    content: "Error handling is poor. Generic messages don't help troubleshoot.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Error Messages", "Debugging"],
  },
  {
    content: "White-label solution lets us rebrand for our clients. Fantastic!",
    channel: "Email",
    sentiment: "POS",
    themes: ["White Label", "Enterprise"],
  },
  {
    content: "Rate limiting without warning caused integration outage.",
    channel: "Slack",
    sentiment: "NEG",
    themes: ["API", "Rate Limiting"],
  },
  {
    content: "Customer success team went above and beyond during our migration.",
    channel: "Review",
    sentiment: "POS",
    themes: ["Support", "Migration"],
  },
  {
    content: "Password reset email sometimes takes 10+ minutes to arrive.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Authentication", "Email"],
  },
  {
    content: "Keyboard shortcuts significantly boost my productivity.",
    channel: "Twitter",
    sentiment: "POS",
    themes: ["UX", "Productivity"],
  },
  {
    content: "GDPR compliance documentation is unclear. Legal team is concerned.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Compliance", "Legal"],
  },
  {
    content: "The API rate limit increase we requested was approved same day.",
    channel: "Email",
    sentiment: "POS",
    themes: ["API", "Support"],
  },
  {
    content: "Webhook delivery is unreliable. We're missing critical events.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["API", "Webhooks", "Reliability"],
  },
  {
    content: "Your platform scales with our team effortlessly.",
    channel: "NPS Survey",
    sentiment: "POS",
    themes: ["Scalability"],
  },
  {
    content: "Browser compatibility issues on Firefox. We had to switch to Chrome.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Browser Compatibility", "Bug"],
  },
  {
    content: "Custom reporting capabilities aligned perfectly with our needs.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Reporting", "Customization"],
  },
  {
    content: "Zero documentation about the new API endpoint. Had to reverse-engineer.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Documentation", "API"],
  },
  {
    content: "Plugin ecosystem adds tremendous value to the core product.",
    channel: "ProductHunt",
    sentiment: "POS",
    themes: ["Ecosystem", "Extensions"],
  },
  {
    content: "Session timeout is too aggressive. Logged out during critical work.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Session Management", "UX"],
  },
  {
    content: "Your mobile-first approach means we can manage everything from our phones.",
    channel: "Twitter",
    sentiment: "POS",
    themes: ["Mobile", "UX"],
  },
  {
    content: "Annual license renewal process is unnecessarily complex.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Billing", "Process"],
  },
  {
    content: "Automated backups give us peace of mind about data safety.",
    channel: "Chat",
    sentiment: "POS",
    themes: ["Backup", "Reliability"],
  },
  {
    content: "Search functionality returns irrelevant results. Filters don't help.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Search", "UX"],
  },
  {
    content: "Migration from our legacy system was seamless. Fantastic team support!",
    channel: "Email",
    sentiment: "POS",
    themes: ["Migration", "Support"],
  },
  {
    content: "Permissions system is too granular. Takes forever to configure.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Security", "Admin"],
  },
  {
    content: "Real-time collaboration features transformed how our team works.",
    channel: "Slack",
    sentiment: "POS",
    themes: ["Collaboration", "Real-time"],
  },
  {
    content: "Support ticket system loses context between replies.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Support", "UX"],
  },
  {
    content: "Customizable dashboards let each team member focus on what matters.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Dashboard", "Personalization"],
  },
  {
    content: "Data export took 3 days to process. We needed it urgently.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Export", "Performance"],
  },
  {
    content: "End-to-end encryption gives us confidence in data security.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Security", "Privacy"],
  },
  {
    content: "Notification preferences don't persist. Keep resetting them.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Notifications", "Bug"],
  },
  {
    content: "Form auto-save prevents data loss from unexpected disconnects.",
    channel: "Twitter",
    sentiment: "POS",
    themes: ["Reliability", "UX"],
  },
  {
    content: "API response times are unpredictable. Latency spikes multiple times daily.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["API", "Performance"],
  },
  {
    content: "Your team's commitment to backwards compatibility is appreciated.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Compatibility", "Support"],
  },
  {
    content: "Dark mode causes readability issues with our custom color scheme.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Theming", "Accessibility"],
  },
  {
    content: "Training resources are extensive and professionally produced.",
    channel: "Review",
    sentiment: "POS",
    themes: ["Education", "Training"],
  },
  {
    content: "Timezone handling caused confusion across our global team.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Internationalization", "UX"],
  },
  {
    content: "Two-factor authentication implementation strengthened our security posture.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Security", "Authentication"],
  },
  {
    content: "Bulk operations timeout frequently with large datasets.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Performance", "Features"],
  },
  {
    content: "Roadmap transparency shows your team listens to customer feedback.",
    channel: "ProductHunt",
    sentiment: "POS",
    themes: ["Communication", "Roadmap"],
  },
  {
    content: "Localization strings are inconsistently translated in UI.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Internationalization", "Language"],
  },
  {
    content: "API versioning strategy keeps our integrations stable.",
    channel: "Email",
    sentiment: "POS",
    themes: ["API", "Compatibility"],
  },
  {
    content: "File upload size restrictions are too strict for our workflows.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Features", "Limitations"],
  },
  {
    content: "Strategic partnership opportunities emerged from using your platform.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Business"],
  },
  {
    content: "Help documentation redirects to dead links repeatedly.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Documentation", "UX"],
  },
  {
    content: "Your commitment to sustainability resonates with our company values.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Corporate", "CSR"],
  },
  {
    content: "Caching strategy causes stale data in real-time scenarios.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["Performance", "Data Freshness"],
  },
  {
    content: "Community forum is incredibly active and helpful.",
    channel: "Twitter",
    sentiment: "POS",
    themes: ["Community", "Support"],
  },
  {
    content: "Account recovery process is outdated and insecure.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Security", "Authentication"],
  },
  {
    content: "Feature flags allow us to gradually roll out changes to our users.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Features", "Deployment"],
  },
  {
    content: "Memory leaks in the web app cause it to slow down over time.",
    channel: "Support",
    sentiment: "NEG",
    themes: ["Performance", "Bug"],
  },
  {
    content: "Your platform's stability during Black Friday was impressive.",
    channel: "Email",
    sentiment: "POS",
    themes: ["Reliability", "Performance"],
  },
  {
    content: "Inconsistent API response formats make data parsing difficult.",
    channel: "Email",
    sentiment: "NEG",
    themes: ["API", "Quality"],
  },
];

async function seed() {
  // Clean up
  await prisma.feedbackTheme.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.theme.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  // Create demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "LOOP Demo Workspace",
      users: {
        create: [
          {
            name: "Admin User",
            email: "admin@demo.loop",
            passwordHash: await hash("demo1234", 10),
            role: "ADMIN",
          },
          {
            name: "Analyst User",
            email: "analyst@demo.loop",
            passwordHash: await hash("demo1234", 10),
            role: "ANALYST",
          },
          {
            name: "Viewer User",
            email: "viewer@demo.loop",
            passwordHash: await hash("demo1234", 10),
            role: "VIEWER",
          },
        ],
      },
    },
    include: {
      users: true,
    },
  });

  console.log(`Workspace created: ${workspace.name}`);
  console.log(`Users created: ${workspace.users.map((u) => u.email).join(", ")}`);

  // Create themes
  const themeNames = [
    "Payment Issues",
    "Performance",
    "Onboarding",
    "UX",
    "Documentation",
    "API",
    "Checkout",
    "Conversion",
    "Support",
    "Response Time",
    "UI/UX",
    "Dashboard",
    "Error Messages",
    "Features",
    "Productivity",
    "Mobile",
    "CSV",
    "Bug",
    "Roadmap",
    "Integrations",
    "Slack",
    "Pricing",
    "Billing",
    "Tax",
    "Notifications",
    "Team",
    "Infrastructure",
    "Analytics",
    "Security",
    "Downtime",
    "Education",
    "Content",
    "Competition",
    "Internationalization",
    "Authentication",
    "Email",
    "White Label",
    "Enterprise",
    "Rate Limiting",
    "Migration",
    "Debugging",
    "Compliance",
    "Legal",
    "Webhooks",
    "Reliability",
    "Scalability",
    "Browser Compatibility",
    "Reporting",
    "Customization",
    "Ecosystem",
    "Extensions",
    "Session Management",
    "Process",
    "Backup",
    "Search",
    "Admin",
    "Collaboration",
    "Real-time",
    "Personalization",
    "Export",
    "Privacy",
    "Theming",
    "Accessibility",
    "Training",
    "Language",
    "Compatibility",
    "Limitations",
    "Business",
    "CSR",
    "Data Freshness",
    "Community",
    "Deployment",
    "Quality",
  ];

  const themes = await Promise.all(
    themeNames.map((name) =>
      prisma.theme.create({
        data: {
          name,
          workspaceId: workspace.id,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        },
      }),
    ),
  );

  console.log(`${themes.length} themes created`);

  // Create feedback and assign themes
  const adminUser = workspace.users.find((u) => u.role === "ADMIN")!;

  let feedbackCount = 0;
  const now = new Date();

  for (let i = 0; i < feedbackSamples.length; i++) {
    const sample = feedbackSamples[i];
    const daysAgo = Math.floor(Math.random() * 90); // Random date within last 90 days
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const feedback = await prisma.feedback.create({
      data: {
        content: sample.content,
        channel: sample.channel,
        customerLabel: ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"][Math.floor(Math.random() * 6)],
        sentiment: sample.sentiment as "POS" | "NEU" | "NEG",
        sentimentScore: sample.sentiment === "POS" ? 0.7 + Math.random() * 0.3 : sample.sentiment === "NEG" ? -0.7 - Math.random() * 0.3 : -0.1 + Math.random() * 0.2,
        status: ["NEW", "REVIEWED", "ACTIONED"][Math.floor(Math.random() * 3)] as "NEW" | "REVIEWED" | "ACTIONED",
        workspaceId: workspace.id,
        createdAt,
      },
    });

    // Assign random themes
    if (sample.themes && sample.themes.length > 0) {
      for (const themeName of sample.themes) {
        const theme = themes.find((t) => t.name === themeName);
        if (theme) {
          await prisma.feedbackTheme.create({
            data: {
              feedbackId: feedback.id,
              themeId: theme.id,
              confidence: 0.7 + Math.random() * 0.3,
            },
          });
        }
      }
    }

    feedbackCount++;
  }

  console.log(`${feedbackCount} feedback items created with theme assignments`);
  console.log("\nDemo credentials:");
  console.log("  Admin:   admin@demo.loop / demo1234");
  console.log("  Analyst: analyst@demo.loop / demo1234");
  console.log("  Viewer:  viewer@demo.loop / demo1234");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
