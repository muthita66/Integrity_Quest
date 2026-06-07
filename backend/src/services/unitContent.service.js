import prisma from "../lib/prisma.js"

const getUnitContent = async (unitId) => {
    return await prisma.unit_contents.findMany({
        where: {
            unit_id: Number(unitId),
            parent_id: {
                not: null,
            },
        },
        orderBy: {
            order_number: 'asc'
        }
    });
};
export default getUnitContent;