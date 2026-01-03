import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function resetDatabase() {
    console.log("🗑️  Resetting database...");
    console.log("   This will drop all tables and recreate them\n");

    try {
        // Use Prisma migrate reset to drop and recreate database
        const { stdout, stderr } = await execAsync("bunx prisma migrate reset --force", {
            cwd: process.cwd(),
        });

        if (stdout) {
            console.log(stdout);
        }

        if (stderr && !stderr.includes("Environment variables")) {
            console.error(stderr);
        }

        console.log("✅ Database reset completed\n");
    } catch (error: any) {
        // If migrate reset fails, try alternative approach
        console.log("⚠️  Migrate reset failed, trying alternative approach...\n");

        try {
            // Alternative: Use db push with force reset
            const { stdout, stderr } = await execAsync("bunx prisma db push --force-reset --accept-data-loss", {
                cwd: process.cwd(),
            });

            if (stdout) {
                console.log(stdout);
            }

            if (stderr && !stderr.includes("Environment variables")) {
                console.error(stderr);
            }

            console.log("✅ Database reset completed (alternative method)\n");
        } catch (altError: any) {
            console.error("❌ Failed to reset database:", altError.message);
            throw altError;
        }
    }
}

async function runSeedScripts() {
    const seedScripts = [
        "seed:printouts",
        "seed:books",
        "seed:photos",
        "seed:business-cards",
        "seed:letter-heads",
        "seed:bill-books",
        "seed:pamphlets-brochures",
        "seed:maps",
        "seed:reviews",
    ];

    console.log("🌱 Running all seed scripts...\n");

    for (const script of seedScripts) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`🚀 Running: ${script}`);
        console.log(`${"=".repeat(60)}\n`);

        try {
            const { stdout, stderr } = await execAsync(`bun run ${script}`, {
                cwd: process.cwd(),
            });

            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.error(stderr);
            }

            console.log(`\n✅ Completed: ${script}\n`);
        } catch (error: any) {
            console.error(`\n❌ Error running ${script}:`, error.message);
            if (error.stdout) {
                console.error("STDOUT:", error.stdout);
            }
            if (error.stderr) {
                console.error("STDERR:", error.stderr);
            }
            throw error;
        }
    }
}

async function main() {
    console.log("=".repeat(60));
    console.log("🔄 DATABASE RESET AND RESEED");
    console.log("=".repeat(60));
    console.log("\n⚠️  WARNING: This will delete ALL data from the database!");
    console.log("   Press Ctrl+C within 5 seconds to cancel...\n");

    // Wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const startTime = Date.now();

    try {
        // Step 1: Reset database
        await resetDatabase();

        // Step 2: Run all seed scripts
        await runSeedScripts();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 DATABASE RESET AND RESEED COMPLETED!");
        console.log("=".repeat(60));
        console.log(`⏱️  Total Time: ${duration}s`);
        console.log("=".repeat(60));
        console.log("\n✅ All data has been cleared and reseeded successfully!");
    } catch (error) {
        console.error("\n❌ Fatal error:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Fatal error in reset script:", error);
    process.exit(1);
});

