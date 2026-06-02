const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Roles
  const rolesData = [
    { role_id: 1, role_name: "student" },
    { role_id: 2, role_name: "teacher" },
    { role_id: 3, role_name: "admin" }
  ];

  for (const role of rolesData) {
    await prisma.roles.upsert({
      where: { role_id: role.role_id },
      update: {},
      create: role,
    });
  }
  console.log("Roles seeded.");

  // 2. Faculty Groups
  const groupsData = [
    { group_id: 1, group_name: "วิทยาศาสตร์และเทคโนโลยี" },
    { group_id: 2, group_name: "มนุษยศาสตร์และสังคมศาสตร์" }
  ];

  for (const group of groupsData) {
    await prisma.faculty_groups.upsert({
      where: { group_id: group.group_id },
      update: {},
      create: group,
    });
  }
  console.log("Faculty Groups seeded.");

  // 3. Faculties
  const facultiesData = [
    { faculty_id: 1, faculty_name: "คณะวิทยาศาสตร์", group_id: 1 },
    { faculty_id: 2, faculty_name: "คณะวิศวกรรมศาสตร์", group_id: 1 },
    { faculty_id: 3, faculty_name: "คณะมนุษยศาสตร์", group_id: 2 }
  ];

  for (const faculty of facultiesData) {
    await prisma.faculties.upsert({
      where: { faculty_id: faculty.faculty_id },
      update: {},
      create: faculty,
    });
  }
  console.log("Faculties seeded.");

  // 4. Majors
  const majorsData = [
    { major_id: 1, major_name: "สาขาวิชาวิทยาการคอมพิวเตอร์", faculty_id: 1 },
    { major_id: 2, major_name: "สาขาวิชาเทคโนโลยีสารสนเทศ", faculty_id: 1 },
    { major_id: 3, major_name: "สาขาวิชาวิศวกรรมคอมพิวเตอร์", faculty_id: 2 },
    { major_id: 4, major_name: "สาขาวิชาวิศวกรรมไฟฟ้า", faculty_id: 2 },
    { major_id: 5, major_name: "สาขาวิชาภาษาอังกฤษ", faculty_id: 3 },
    { major_id: 6, major_name: "สาขาวิชาภาษาไทย", faculty_id: 3 }
  ];

  for (const major of majorsData) {
    await prisma.majors.upsert({
      where: { major_id: major.major_id },
      update: {},
      create: major,
    });
  }
  console.log("Majors seeded.");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
