const { PrismaClient } = require("./app/generated/prisma");

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const userId = "8c8b6838-b00e-4bd2-af3a-5782522f96f3";

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    console.log("✓ Usuario actualizado:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Nombre: ${user.name}`);
    console.log(`  Rol: ${user.role}`);
  } catch (error) {
    console.error("✗ Error al actualizar usuario:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
